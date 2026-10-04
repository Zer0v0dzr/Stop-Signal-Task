// ============================================================
// Supabase Database Module
// Stop-Signal Task (SST)
// ============================================================

const SUPABASE_URL =
    "https://sxvtbwtitdbaflaigahj.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9LVOphB0mpLVwN5x6qLCLA_ha1Z5DH6";


// ============================================================
// Database status
// ============================================================

function setSSTDBStatus(
    text,
    status
){

    const element =
        document.getElementById(
            "db-status"
        );


    if(!element){
        return;
    }


    element.textContent =
        "数据库：" + text;


    if(status === "ok"){

        element.style.background =
            "#d9f5d9";

        element.style.color =
            "#176b17";

    }
    else if(status === "error"){

        element.style.background =
            "#ffd6d6";

        element.style.color =
            "#8b0000";

    }
    else{

        element.style.background =
            "#eeeeee";

        element.style.color =
            "#333333";

    }

}


// ============================================================
// Initialize Supabase
// ============================================================

let supabaseClient =
    null;


/*
    注意：

    SDK 加载失败时，
    不允许这里直接报错。

    SST 必须仍然能够继续。
*/

if(
    typeof window.supabase ===
    "undefined"
){

    console.warn(
        "Supabase SDK unavailable. " +
        "SST will continue locally."
    );


    setSSTDBStatus(
        "连接不可用，仅本地保存",
        "error"
    );

}
else{

    try{

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        );


        console.log(
            "Supabase SDK initialized."
        );


        setSSTDBStatus(
            "SDK已加载",
            "waiting"
        );

    }
    catch(error){

        console.error(
            "Supabase initialization failed:",
            error
        );


        supabaseClient =
            null;


        setSSTDBStatus(
            "初始化失败，仅本地保存",
            "error"
        );

    }

}


// ============================================================
// Session state
// ============================================================

let currentSessionID =
    null;


// ============================================================
// Generate UUID
// ============================================================

function generateSessionID(){

    if(
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ){

        return crypto.randomUUID();

    }


    /*
        老浏览器 / 微信 WebView fallback

        仍生成标准 UUID v4 格式。
    */

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        .replace(
            /[xy]/g,
            function(c){

                const r =
                    Math.random() *
                    16 |
                    0;


                const v =
                    c === "x"
                        ?
                        r
                        :
                        (
                            r &
                            0x3 |
                            0x8
                        );


                return v.toString(
                    16
                );

            }
        );

}


// ============================================================
// Wait helper
// ============================================================

function wait(ms){

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


// ============================================================
// Create SST session
// ============================================================

async function createSSTSession(
    subjectID
){

    /*
        Supabase 不可用时：
        直接返回 false。

        experiment.js 会继续实验，
        不阻断被试。
    */

    if(
        !supabaseClient
    ){

        console.warn(
            "Supabase unavailable. " +
            "SST session will not be created."
        );


        setSSTDBStatus(
            "未连接，仅本地保存",
            "error"
        );


        return false;

    }


    if(
        currentSessionID
    ){

        return true;

    }


    currentSessionID =
        generateSessionID();


    setSSTDBStatus(
        "正在连接...",
        "waiting"
    );


    for(
        let attempt = 1;
        attempt <= 3;
        attempt++
    ){

        try{

            const { error } =
                await supabaseClient
                    .from(
                        "sst_sessions"
                    )
                    .insert({

                        session_id:
                            currentSessionID,

                        subject:
                            subjectID,

                      task_version:
                            TASK_VERSION,
                        
                        completed:
                            false

                    });


            if(
                !error
            ){

                console.log(
                    "Supabase: SST session created:",
                    currentSessionID
                );


                setSSTDBStatus(
                    "连接正常",
                    "ok"
                );


                return true;

            }


            console.error(
                "Supabase: session creation attempt " +
                attempt +
                " failed:",
                error
            );


            setSSTDBStatus(
                "连接失败 " +
                attempt +
                "/3",
                "error"
            );

        }
        catch(error){

            console.error(
                "Supabase: session creation attempt " +
                attempt +
                " failed:",
                error
            );


            setSSTDBStatus(
                "连接异常 " +
                attempt +
                "/3",
                "error"
            );

        }


        if(
            attempt <
            3
        ){

            await wait(
                1000 *
                attempt
            );

        }

    }


    console.warn(
        "Supabase unavailable. " +
        "Experiment will continue with local CSV backup."
    );


    setSSTDBStatus(
        "连接失败，仅本地保存",
        "error"
    );


    return false;

}


// ============================================================
// Upload one SST trial
// ============================================================

async function uploadSSTTrial(
    trialData
){

    /*
        SDK / client 不可用：
        不报错、不阻断。
    */

    if(
        !supabaseClient
    ){

        console.warn(
            "Supabase unavailable; " +
            "trial retained locally only."
        );


        setSSTDBStatus(
            "未连接，仅本地保存",
            "error"
        );


        return false;

    }


    /*
        Session 没创建成功时，
        仍然允许 SST 正常继续。
    */

    if(
        !currentSessionID
    ){

        console.warn(
            "Supabase: no active session; " +
            "trial retained locally only."
        );


        setSSTDBStatus(
            "无有效Session，仅本地保存",
            "error"
        );


        return false;

    }


    const row = {

        session_id:
            currentSessionID,

        subject:
            trialData.subject ??
            null,

        phase:
            trialData.phase ??
            null,

        practice_attempt:
            trialData.practiceAttempt ??
            0,

        block:
            trialData.block ??
            null,

        trial:
            trialData.trial ??
            null,

        type:
            trialData.type ??
            null,

        direction:
            trialData.direction ??
            null,

        response:
            trialData.response ??
            null,

        rt:
            trialData.RT ??
            null,

        accuracy:
            trialData.accuracy ??
            null,

        choice_error:
            trialData.choiceError ??
            null,

        go_omission:
            trialData.goOmission ??
            null,

        ssd:
            trialData.SSD ??
            null,

        stop_success:
            trialData.stopSuccess ??
            null,

        premature_response:
            trialData.prematureResponse ??
            null,

        trial_timestamp:
            trialData.trialTimestamp ??
            null

    };


    for(
        let attempt = 1;
        attempt <= 3;
        attempt++
    ){

        try{

            const { error } =
                await supabaseClient
                    .from(
                        "sst_trials"
                    )
                    .insert(
                        row
                    );


            if(
                !error
            ){

                console.log(
                    "Supabase: trial uploaded:",
                    trialData.phase,
                    "practice attempt:",
                    trialData.practiceAttempt ??
                    0,
                    "block:",
                    trialData.block,
                    "trial:",
                    trialData.trial
                );


                setSSTDBStatus(
                    "实时同步正常",
                    "ok"
                );


                return true;

            }


            /*
                Duplicate trial。

                如果同一条数据已经存在，
                视为已经安全保存。
            */

            if(
                error.code ===
                "23505"
            ){

                console.log(
                    "Supabase: trial already exists:",
                    trialData.phase,
                    "practice attempt:",
                    trialData.practiceAttempt ??
                    0,
                    "block:",
                    trialData.block,
                    "trial:",
                    trialData.trial
                );


                setSSTDBStatus(
                    "实时同步正常",
                    "ok"
                );


                return true;

            }


            console.error(
                "Supabase: trial upload attempt " +
                attempt +
                " failed:",
                error
            );

        }
        catch(error){

            console.error(
                "Supabase: trial upload attempt " +
                attempt +
                " failed:",
                error
            );

        }


        if(
            attempt <
            3
        ){

            await wait(
                1000 *
                attempt
            );

        }

    }


    console.warn(
        "Supabase: trial upload failed after retries. " +
        "Trial remains available in local CSV:",
        trialData
    );


    setSSTDBStatus(
        "部分上传失败，请结束后下载CSV",
        "error"
    );


    return false;

}


// ============================================================
// Complete SST session
// ============================================================

async function completeSSTSession(){

    if(
        !supabaseClient
    ){

        console.warn(
            "Supabase unavailable; " +
            "session cannot be completed remotely."
        );


        setSSTDBStatus(
            "未连接，请下载CSV",
            "error"
        );


        return false;

    }


    if(
        !currentSessionID
    ){

        console.warn(
            "Supabase: no active session."
        );


        setSSTDBStatus(
            "无有效Session，请下载CSV",
            "error"
        );


        return false;

    }


    for(
        let attempt = 1;
        attempt <= 3;
        attempt++
    ){

        try{

            const { error } =
                await supabaseClient
                    .rpc(
                        "complete_sst_session",
                        {

                            p_session_id:
                                currentSessionID

                        }
                    );


            if(
                !error
            ){

                console.log(
                    "Supabase: SST session completed:",
                    currentSessionID
                );


                setSSTDBStatus(
                    "实验数据已同步",
                    "ok"
                );


                return true;

            }


            console.error(
                "Supabase: completion attempt " +
                attempt +
                " failed:",
                error
            );

        }
        catch(error){

            console.error(
                "Supabase: completion attempt " +
                attempt +
                " failed:",
                error
            );

        }


        if(
            attempt <
            3
        ){

            await wait(
                1000 *
                attempt
            );

        }

    }


    console.warn(
        "Supabase: session completion failed."
    );


    setSSTDBStatus(
        "同步未完成，请下载CSV",
        "error"
    );


    return false;

}
