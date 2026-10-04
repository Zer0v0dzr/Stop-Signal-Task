// ======================================
// SST Main Experiment
// Version: instruction + practice feedback
// ======================================



let experimentPlan;


// subject

let subjectID = "";



// phase

let currentPhase = "";

let currentBlock = 0;


// 第二阶段 SST practice 当前是第几次尝试
// 第一次 = 1
// 失败重做 = 2, 3, 4...
let practiceAttempt = 0;



// trial

let currentTrialList = [];

let currentTrialIndex = 0;

let currentTrial;



// data

let allData = [];

// 所有尚未完成的数据库上传任务
let pendingDatabaseOperations = [];


// response

let currentResponseFunction = null;



// timing

let stimulusOnset = null;
const TRIAL_DURATION = 1500;
let activeTrialState = null;



// response enable

let responseEnabled = false;



// experiment state

let pendingContinue = null;





// ======================================
// init
// ======================================


initExperiment();



function initExperiment(){


    experimentPlan =
    createExperiment();



    console.log(
        "Experiment plan:",
        experimentPlan
    );



    showSubjectScreen();


}







// ======================================
// Subject entry
// ======================================

function showSubjectScreen(){

    [
        "instruction-screen",
        "fixation",
        "stimulus",
        "response-area"
    ].forEach(id=>{

        const element =
            document.getElementById(id);

        if(element){
            element.style.display = "none";
        }
    });


    const screen =
        document.createElement("div");

    screen.id =
        "subject-screen";


    Object.assign(
        screen.style,
        {
            position: "fixed",
            inset: "0",
            zIndex: "3000",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            backgroundColor:
                "rgb(128,128,128)",

            color: "white",

            fontFamily:
                "Arial, 'Microsoft YaHei', sans-serif",

            padding: "24px",

            boxSizing:
                "border-box",

            overflowY:
                "auto"
        }
    );


    const form =
        document.createElement("form");

    form.noValidate =
        true;


    Object.assign(
        form.style,
        {
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
            margin: "auto"
        }
    );


    const title =
        document.createElement("h1");

    title.textContent =
        "停止信号任务";


    Object.assign(
        title.style,
        {
            fontSize:
                "clamp(30px, 5vw, 42px)",

            margin:
                "0 0 44px",

            fontWeight:
                "bold"
        }
    );


    const label =
        document.createElement("label");

    label.htmlFor =
        "subject-id-input";

    label.textContent =
        "被试编号";


    Object.assign(
        label.style,
        {
            display: "block",
            fontSize: "24px",
            marginBottom: "16px"
        }
    );


    const input =
        document.createElement("input");

    input.id =
        "subject-id-input";

    input.type =
        "text";

    input.placeholder =
        "请输入被试编号";

    input.autofocus =
        true;

    input.autocomplete =
        "off";

    input.spellcheck =
        false;

    input.setAttribute(
        "aria-describedby",
        "subject-id-error"
    );


    Object.assign(
        input.style,
        {
            width: "100%",
            boxSizing: "border-box",
            padding: "16px 18px",

            border:
                "2px solid white",

            borderRadius:
                "6px",

            backgroundColor:
                "white",

            color:
                "#222",

            fontSize:
                "24px",

            textAlign:
                "center",

            fontFamily:
                "inherit",

            userSelect:
                "text"
        }
    );


    const error =
        document.createElement("div");

    error.id =
        "subject-id-error";

    error.setAttribute(
        "role",
        "alert"
    );


    Object.assign(
        error.style,
        {
            minHeight: "30px",
            margin: "10px 0 22px",
            fontSize: "20px",
            lineHeight: "1.5",
            fontWeight: "bold",
            color: "#fff0a3"
        }
    );


    const button =
        document.createElement("button");

    button.type =
        "submit";

    button.textContent =
        "开始实验";


    Object.assign(
        button.style,
        {
            padding:
                "14px 40px",

            border:
                "2px solid white",

            borderRadius:
                "6px",

            backgroundColor:
                "rgb(100,100,100)",

            color:
                "white",

            fontFamily:
                "inherit",

            fontSize:
                "24px",

            fontWeight:
                "bold",

            cursor:
                "pointer",

            touchAction:
                "manipulation"
        }
    );


    let submitted =
        false;


    form.addEventListener(
        "submit",
        async event=>{

            event.preventDefault();


            if(submitted){
                return;
            }


            const value =
                input.value.trim();


            if(!value){

                error.textContent =
                    "请输入被试编号";

                input.setAttribute(
                    "aria-invalid",
                    "true"
                );

                input.style.borderColor =
                    "#fff0a3";

                input.focus();

                return;
            }


            submitted =
                true;

            subjectID =
                value;


            /*
             * 创建 Supabase session。
             *
             * 最多尝试约数秒。
             * 即使数据库不可用，
             * 实验仍然继续，
             * CSV 仍作为完整本地备份。
             */

            button.disabled =
                true;

            button.textContent =
                "正在准备实验…";

            error.textContent =
                "";


            try{

                await createSSTSession(
                    subjectID
                );

            }catch(databaseError){

                console.error(
                    "Supabase session initialization failed:",
                    databaseError
                );
            }


            screen.remove();


            showGoInstruction();


            document
                .getElementById(
                    "response-area"
                )
                .style.display =
                    "flex";
        }
    );


    input.addEventListener(
        "input",
        ()=>{

            if(
                input.value.trim()
            ){

                error.textContent =
                    "";

                input.removeAttribute(
                    "aria-invalid"
                );

                input.style.borderColor =
                    "white";
            }
        }
    );


    form.append(
        title,
        label,
        input,
        error,
        button
    );


    screen.appendChild(
        form
    );


    document.body.appendChild(
        screen
    );


    input.focus();
}


// ======================================
// Instruction
// ======================================


function prepareInstruction(onContinue){
    responseEnabled = false;
    currentResponseFunction = null;
    activeTrialState = null;
    pendingContinue = onContinue;
    hideStimulus();
    document.getElementById("fixation").style.display = "none";
}

function showGoInstruction(){
    prepareInstruction(startGoPractice);
    const instruction = document.createElement("div");
    instruction.id = "instruction-screen";
    instruction.innerHTML = `
<div class="instruction">
<p>练习一</p>
<p>请您全程注视屏幕中央的注视点。</p>
<p>屏幕中央会出现向左或向右的白色箭头。<br>
请根据箭头方向，尽可能快速且准确地点击对应的“左”或“右”按钮。</p>
<div class="example-box">
<img src="stimuli/Left_Go.png" class="example-image">
<img src="stimuli/Right_Go.png" class="example-image">
</div>
<p>请将两只手的食指置于两个按钮的上方。</p>
<p>在保证正确的情况下尽可能快地做出反应。</p>
<p>请按下“左”或“右”键开始练习。</p>
</div>`;
    Object.assign(instruction.style, {
        position: "fixed", top: "0", left: "0",
        width: "100%", height: "100%", zIndex: "1000",
        pointerEvents: "none"
    });
    document.body.appendChild(instruction);
}

function startGoPractice(){
    currentPhase = "goPractice";
    currentBlock = 0;
    currentTrialList = experimentPlan.goPractice;
    currentTrialIndex = 0;
    runNextTrial();
}
function showInstruction(){
    prepareInstruction(startPractice);


let instruction =
document.createElement("div");


instruction.id =
"instruction-screen";


instruction.innerHTML =


`
<div class="instruction">
<p>练习二</p>
<p>
请您全程注视屏幕中央的注视点。
</p>


<p>
当屏幕中呈现白色箭头时，<br>
请根据箭头方向尽可能快速且准确地点击对应按钮。
</p>



<div class="example-box">

<img src="stimuli/Left_Go.png"
class="example-image">

<img src="stimuli/Right_Go.png"
class="example-image">

</div>



<p>
需要注意的是：<br>
如果箭头变成红色，则不能点击按钮。
</p>



<div class="example-box">

<img src="stimuli/Left_Stop.png"
class="example-image">

<img src="stimuli/Right_Stop.png"
class="example-image">

</div>



<p>
请始终尽可能快地做出反应，停止成功或失败都是正常的，不要刻意等待。
</p>


<p>
只有在确定理解规则后，才能开始正式实验。
</p>


<p>
请按下“左”或“右”键开始练习。
</p>


</div>
`;



instruction.style.position="fixed";

instruction.style.top="0";

instruction.style.left="0";

instruction.style.width="100%";

instruction.style.height="100%";

instruction.style.zIndex="1000";
 instruction.style.pointerEvents="none";


document.body.appendChild(
instruction
);


}







// ======================================
// Practice
// ======================================


function startPractice(){

    document
        .getElementById(
            "response-area"
        )
        .style.display =
            "flex";


    currentPhase =
        "practice";


    currentBlock =
        0;


    // 每进入一次第二阶段练习，
    // attempt +1。
    //
    // 第一次进入：1
    // 第一次失败后重新进入：2
    // 再失败：3
    // ...

    practiceAttempt++;


    console.log(
        "Starting SST practice attempt:",
        practiceAttempt
    );


    currentTrialList =
        experimentPlan.practice;


    currentTrialIndex =
        0;


    runNextTrial();
}






// ======================================
// Block
// ======================================


function startBlock(blockIndex){

if(blockIndex===0){
    resetFormalSSD();
}
    currentBlock =
    blockIndex + 1;



    currentPhase =
    "block"+currentBlock;



    currentTrialList =
    experimentPlan.blocks[blockIndex];



    currentTrialIndex=0;



    runNextTrial();


}






// ======================================
// Trial control
// ======================================


function runNextTrial(){



    if(
        currentTrialIndex >=
        currentTrialList.length
    ){


        finishPhase();


        return;


    }




    currentTrial =
    currentTrialList[currentTrialIndex];



    currentTrialIndex++;



    showFixation();



}






// ======================================
// Fixation
// ======================================


function showFixation(){
    responseEnabled = false;
    currentResponseFunction = null;



    let fixation =
    document.getElementById(
        "fixation"
    );



    fixation.style.display =
    "block";



    hideStimulus();




    setTimeout(()=>{


        fixation.style.display =
        "none";



        runTrial(
            currentTrial
        );



    },
    CONFIG.fixationDuration);



}






// ======================================
// Trial type
// ======================================


function runTrial(trial){



    if(
        trial.type==="Go"
    ){


        runGoTrial(trial);


    }
    else if(
        trial.type==="Stop"
    ){


        runStopTrial(trial);


    }



}
// ======================================
// Go Trial
// ======================================


function runGoTrial(trial){
    startTimedTrial(trial, false);
}

function runStopTrial(trial){
    startTimedTrial(trial, true);
}

// Practice retains its original timing, response handling and direction SSDs.
function startTimedTrial(trial, isStop){
    if(currentPhase === "practice" || currentPhase === "goPractice"){
        startPracticeTimedTrial(trial, isStop);
        return;
    }
    startFormalTimedTrial(trial, isStop);
}

function startFormalTimedTrial(trial, isStop){
    responseEnabled = false;
    currentResponseFunction = null;

    const stimulus = document.getElementById("stimulus");

    const state = {
        trial,
        responded: false,
        ended: false,
        saved: false,
        endTimer: null,
        stopTimer: null,
        onset: null
    };

    activeTrialState = state;

    Object.assign(trial, {
        RT: null,
        response: null,

        // Go trial 默认未正确；Stop trial 在 trial 结束时确定
        accuracy: isStop ? null : 0,

        // 新增数据字段
        choiceError: 0,
        goOmission: isStop ? null : 0,
        prematureResponse: isStop ? 0 : null,
        trialTimestamp: null,

        // SST 核心变量
        stopSuccess: null,
        SSD: isStop ? formalSSD : null,

        // 以下变量仅供程序内部控制时序/QC，
        // 不再导出到正式 CSV
        requestedSSD: isStop ? formalSSD : null,
        observedSSD: null,
        stopPresented: false
    });

    stimulus.src =
        "stimuli/" +
        trial.direction +
        "_Go.png";

    stimulus.style.display = "block";

    // trialTimestamp = Go stimulus onset 的实际日期时间
    trial.trialTimestamp = new Date().toISOString();

    state.onset =
        stimulusOnset =
        performance.now();


    function endAtDeadline(){

        if(
            activeTrialState !== state ||
            state.ended
        ){
            return;
        }

        const remaining =
            state.onset +
            TRIAL_DURATION -
            performance.now();

        if(remaining > 0){

            state.endTimer =
                setTimeout(
                    endAtDeadline,
                    remaining
                );

            return;
        }


        state.ended = true;

        clearTimeout(
            state.endTimer
        );

        clearTimeout(
            state.stopTimer
        );

        responseEnabled = false;

        currentResponseFunction = null;

        hideStimulus();


        // ------------------------------
        // Stop trial：没有任何反应
        // = 成功停止
        // ------------------------------

        if(
            isStop &&
            !state.responded
        ){

            trial.stopSuccess = 1;

            trial.accuracy = 1;

            trial.choiceError = 0;

            trial.prematureResponse = 0;

            updateFormalSSD(true);
        }


        // ------------------------------
        // Go trial：没有任何反应
        // = omission
        // ------------------------------

        if(
            !isStop &&
            !state.responded
        ){

            trial.accuracy = 0;

            trial.choiceError = 0;

            trial.goOmission = 1;
        }


        finishTrial(trial);
    }



    currentResponseFunction =
    function(side, button){

        if(
            activeTrialState !== state ||
            state.ended ||
            state.responded ||
            !responseEnabled
        ){
            return;
        }


        const now =
            performance.now();


        if(
            now >=
            state.onset +
            TRIAL_DURATION
        ){

            endAtDeadline();

            return;
        }


        state.responded = true;

        responseEnabled = false;

        currentResponseFunction = null;


        trial.RT =
            now -
            state.onset;

        trial.response =
            side;


        // ==================================
        // STOP TRIAL
        // ==================================

        if(isStop){

            // 只要 Stop trial 做出了反应，
            // 就属于停止失败
            trial.stopSuccess = 0;

            trial.accuracy = 0;


            // Stop 出现前反应
            trial.prematureResponse =
                trial.RT < trial.SSD
                ? 1
                : 0;


            // 是否按错了 Go 箭头方向
            trial.choiceError =
                side ===
                trial.direction.toLowerCase()
                ? 0
                : 1;


            updateFormalSSD(false);


            // 保留原正式实验逻辑：
            // 如果 Stop 已经呈现，则立即隐藏；
            // 如果是 premature response，
            // Go 保持到计划 SSD，
            // Stop 仍然会按计划出现。
            if(
                trial.stopPresented
            ){
                hideStimulus();
            }

        }

        // ==================================
        // GO TRIAL
        // ==================================

        else{

            const correct =
                side ===
                trial.direction.toLowerCase();


            trial.accuracy =
                correct
                ? 1
                : 0;


            trial.choiceError =
                correct
                ? 0
                : 1;


            trial.goOmission = 0;


            hideStimulus();
        }


        buttonFeedback(button);
    };


    responseEnabled = true;


    state.endTimer =
        setTimeout(
            endAtDeadline,
            Math.max(
                0,
                state.onset +
                TRIAL_DURATION -
                performance.now()
            )
        );


    // ==================================
    // STOP SIGNAL
    // ==================================

    if(isStop){

        const presentStop = ()=>{

            if(
                activeTrialState !== state ||
                state.ended
            ){
                return;
            }


            const now =
                performance.now();


            if(
                now >=
                state.onset +
                TRIAL_DURATION
            ){
                return;
            }


            const remaining =
                state.onset +
                trial.requestedSSD -
                now;


            if(remaining > 0){

                state.stopTimer =
                    setTimeout(
                        presentStop,
                        remaining
                    );

                return;
            }


            stimulus.src =
                "stimuli/" +
                trial.direction +
                "_Stop.png";


            stimulus.style.display =
                "block";


            // 内部保留，不导出 CSV
            trial.observedSSD =
                performance.now() -
                state.onset;


            trial.stopPresented =
                true;
        };


        state.stopTimer =
            setTimeout(
                presentStop,
                Math.max(
                    0,
                    state.onset +
                    trial.requestedSSD -
                    performance.now()
                )
            );
    }
}

// Original practice implementation.
function startPracticeTimedTrial(trial, isStop){

    responseEnabled = false;

    currentResponseFunction = null;


    const stimulus =
        document.getElementById(
            "stimulus"
        );


    const state = {

        trial,

        responded: false,

        ended: false,

        saved: false,

        endTimer: null,

        stopTimer: null,

        onset: null
    };


    activeTrialState = state;


    trial.RT = null;

    trial.response = null;

    trial.accuracy =
        isStop
        ? null
        : 0;

    trial.choiceError = 0;

    trial.goOmission =
        isStop
        ? null
        : 0;

    trial.prematureResponse =
        isStop
        ? 0
        : null;

    trial.trialTimestamp = null;


    if(isStop){

        trial.SSD =
            SSD[
                trial.direction
            ];

        trial.stopSuccess =
            null;

    }else{

        trial.SSD = null;

        trial.stopSuccess =
            null;
    }


    stimulus.src =
        "stimuli/" +
        (
            isStop
            ?
            trial.direction +
            "_Go"
            :
            trial.stimulus
        ) +
        ".png";


    stimulus.style.display =
        "block";


    trial.trialTimestamp =
        new Date().toISOString();


    state.onset =
        stimulusOnset =
        performance.now();



    function endAtDeadline(){

        if(
            activeTrialState !== state ||
            state.ended
        ){
            return;
        }


        const remaining =
            state.onset +
            TRIAL_DURATION -
            performance.now();


        if(remaining > 0){

            state.endTimer =
                setTimeout(
                    endAtDeadline,
                    remaining
                );

            return;
        }


        state.ended = true;


        clearTimeout(
            state.endTimer
        );


        clearTimeout(
            state.stopTimer
        );


        responseEnabled =
            false;


        currentResponseFunction =
            null;


        hideStimulus();


        // Stop trial 无反应
        // = 成功停止

        if(
            isStop &&
            !state.responded
        ){

            trial.stopSuccess =
                1;

            trial.accuracy =
                1;

            trial.choiceError =
                0;

            trial.prematureResponse =
                0;


            updateSSD(
                trial.direction,
                true
            );
        }


        // Go omission

        if(
            !isStop &&
            !state.responded
        ){

            trial.accuracy =
                0;

            trial.choiceError =
                0;

            trial.goOmission =
                1;
        }


        finishTrial(
            trial
        );
    }



    currentResponseFunction =
    function(side, button){

        if(
            activeTrialState !== state ||
            state.ended ||
            state.responded ||
            !responseEnabled
        ){
            return;
        }


        const now =
            performance.now();


        if(
            now >=
            state.onset +
            TRIAL_DURATION
        ){

            endAtDeadline();

            return;
        }


        state.responded =
            true;


        responseEnabled =
            false;


        currentResponseFunction =
            null;


        clearTimeout(
            state.stopTimer
        );


        trial.RT =
            now -
            state.onset;


        trial.response =
            side;


        hideStimulus();


        // =========================
        // STOP PRACTICE
        // =========================

        if(isStop){

            trial.stopSuccess =
                0;

            trial.accuracy =
                0;


            trial.prematureResponse =
                trial.RT <
                trial.SSD
                ? 1
                : 0;


            trial.choiceError =
                side ===
                trial.direction.toLowerCase()
                ? 0
                : 1;


            updateSSD(
                trial.direction,
                false
            );

        }

        // =========================
        // GO PRACTICE
        // =========================

        else{

            const correct =
                side ===
                trial.direction.toLowerCase();


            trial.accuracy =
                correct
                ? 1
                : 0;


            trial.choiceError =
                correct
                ? 0
                : 1;


            trial.goOmission =
                0;
        }


        buttonFeedback(
            button
        );
    };


    responseEnabled =
        true;


    state.endTimer =
        setTimeout(

            endAtDeadline,

            Math.max(
                0,
                state.onset +
                TRIAL_DURATION -
                performance.now()
            )
        );


    if(isStop){

        state.stopTimer =
            setTimeout(
                ()=>{

                    if(
                        activeTrialState !== state ||
                        state.ended ||
                        state.responded ||
                        performance.now() >=
                        state.onset +
                        TRIAL_DURATION
                    ){
                        return;
                    }


                    stimulus.src =
                        "stimuli/" +
                        trial.direction +
                        "_Stop.png";

                },

                Math.max(
                    0,
                    state.onset +
                    trial.SSD -
                    performance.now()
                )
            );
    }
}


// ======================================
// Button feedback
// ======================================


function buttonFeedback(button){



    button.style.backgroundColor =
    "rgb(180,180,180)";



    setTimeout(()=>{


        button.style.backgroundColor =
        "rgb(100,100,100)";



    },
    100);



}









// ======================================
// Finish Trial
// ======================================


function finishTrial(trial){



    saveTrial(trial);



}









// ======================================
// Practice feedback
// ======================================


function showPracticeFeedback(trial){



    let correct=false;



    if(trial.type==="Go"){


        correct =
        trial.accuracy===1;


    }



    if(trial.type==="Stop"){


        correct =
        trial.stopSuccess===1;


    }





    let feedback =
    document.createElement(
        "div"
    );



    feedback.innerHTML =
    correct
    ?
    "正确"
    :
    "错误";



    feedback.style.position =
    "fixed";



    feedback.style.top =
    "50%";



    feedback.style.left =
    "50%";



    feedback.style.transform =
    "translate(-50%,-50%)";



    feedback.style.fontSize =
    "80px";



    feedback.style.color =
    correct
    ?
    "green"
    :
    "red";



    document.body.appendChild(
        feedback
    );



    setTimeout(()=>{


        feedback.remove();



    },
    1000);



}









// ======================================
// Save Data
// ======================================


function saveTrial(trial){

    const state =
        activeTrialState;


    if(
        !state ||
        state.trial !== trial ||
        !state.ended ||
        state.saved
    ){
        return;
    }


    state.saved =
        true;


    // ========================================================
    // Construct final trial row
    // ========================================================

    const trialRow = {

        subject:
            subjectID,

        phase:
            currentPhase,

        block:
            currentBlock,

        trial:
            currentTrialIndex,

        type:
            trial.type,

        direction:
            trial.direction,

        response:
            trial.response,

        RT:
            trial.RT,

        accuracy:
            trial.accuracy,

        choiceError:
            trial.choiceError,

        goOmission:
            trial.goOmission,

        SSD:
            trial.SSD,

        stopSuccess:
            trial.stopSuccess,

        prematureResponse:
            trial.prematureResponse,

        trialTimestamp:
            trial.trialTimestamp,


        // ====================================================
        // Database-only metadata
        //
        // practice:
        //     1,2,3...
        //
        // goPractice / formal:
        //     0
        //
        // data.js 的固定 CSV headers 中没有这个字段，
        // 所以不会改变最终 CSV 的 15 列。
        // ====================================================

        practiceAttempt:
            currentPhase === "practice"
            ? practiceAttempt
            : 0
    };


    // ========================================================
    // Local data
    // ========================================================

    allData.push(
        trialRow
    );


    // ========================================================
    // Supabase background upload
    //
    // 不 await。
    // 网络延迟不会阻塞实验 trial timing。
    // ========================================================

    const uploadPromise =
        uploadSSTTrial(
            trialRow
        )
        .catch(error=>{

            console.error(
                "Supabase background upload error:",
                error
            );

            return false;

        });


    pendingDatabaseOperations.push(
        uploadPromise
    );


    // ========================================================
    // Practice feedback
    // ========================================================

    if(
        currentPhase === "practice" ||
        currentPhase === "goPractice"
    ){

        showPracticeFeedback(
            trial
        );
    }


    // ========================================================
    // Continue
    // ========================================================

    if(
        currentPhase === "practice" ||
        currentPhase === "goPractice"
    ){

        setTimeout(
            ()=>{

                if(
                    activeTrialState !== state
                ){
                    return;
                }


                activeTrialState =
                    null;


                runNextTrial();

            },
            1000
        );

    }else{

        activeTrialState =
            null;


        runNextTrial();
    }
}
// ======================================
// Phase Finish
// ======================================


function finishPhase(){
    if(currentPhase === "goPractice"){
        showInstruction();
    }else if(currentPhase === "practice"){
        const practiceTrials = allData.filter(d=>d.phase === "practice");
        const correctCount = practiceTrials.filter(d=>
            d.type === "Go" ? d.accuracy === 1 : d.stopSuccess === 1
        ).length;
        if(practiceTrials.length === 10 && correctCount >= 8){
            showPracticeEndInstruction(
                "练习完成，接下来将进入正式实验。请按下‘左’或‘右’键开始正式实验。",
                ()=>startBlock(0)
            );
        }else{
            // Preserve goPractice rows; retain the original SST retry data policy.
            allData = allData.filter(d=>d.phase !== "practice");
            showPracticeEndInstruction(
                "本轮练习正确不足8次，请重新进行第二阶段练习。请按下‘左’或‘右’键重新开始练习。",
                ()=>startPractice()
            );
        }
    }else if(currentBlock >= 1 && currentBlock < CONFIG.blocks){
        showBlockRest();
    }else if(currentBlock === CONFIG.blocks){
        endExperiment();
    }
}

function showBlockRest(){

    // ======================================
    // Get data from the completed block
    // ======================================

    const rows =
        allData.filter(
            d =>
                d.phase === currentPhase &&
                d.block === currentBlock
        );


    // ======================================
    // Go statistics
    // ======================================

    const go =
        rows.filter(
            d => d.type === "Go"
        );


    const correctGo =
        go.filter(
            d =>
                d.accuracy === 1 &&
                Number.isFinite(d.RT)
        );


    const meanGoRT =
        correctGo.length
        ?
        (
            correctGo.reduce(
                (sum, d) => sum + d.RT,
                0
            )
            /
            correctGo.length
        ).toFixed(0) + " ms"
        :
        "无正确反应";


    const goOmissions =
        go.filter(
            d => d.response === null
        ).length;


    // ======================================
    // Stop statistics
    // ======================================

    const stop =
        rows.filter(
            d => d.type === "Stop"
        );


    const stopResponses =
        stop.filter(
            d => d.response !== null
        ).length;


    const stopResponsePercent =
        stop.length
        ?
        (
            100 *
            stopResponses /
            stop.length
        ).toFixed(0) + "%"
        :
        "无";


    // ======================================
    // Next block
    // ======================================

    const nextBlockIndex =
        currentBlock;


    let resumed = false;

    let timer = null;


    const resume = ()=>{

        if(resumed){
            return;
        }


        resumed = true;


        clearTimeout(timer);


        pendingContinue = null;


        const panel =
            document.getElementById(
                "practice-end-instruction"
            );


        if(panel){
            panel.remove();
        }


        startBlock(
            nextBlockIndex
        );

    };


    // ======================================
    // Rest / feedback screen
    // ======================================

    showPracticeEndInstruction(

        "第 " +
        currentBlock +
        " / " +
        CONFIG.blocks +
        " 组完成\n\n" +

        "本组平均反应时间：" +
        meanGoRT +
        "\n" +

        "白色箭头未作答：" +
        goOmissions +
        " 次\n" +

        "停止信号出现后仍做出反应：" +
        stopResponsePercent +
        "(理想情况下接近50%) \n\n" +

        "请继续根据白色箭头的方向尽可能快速且准确地作答。\n" +

        "停止成功或失败都是正常的，请不要为了等待红色停止信号而故意放慢反应。\n\n" +

        "最长休息时间：15 秒\n" +

        "按下“左”或“右”键可提前继续实验。",

        resume

    );


    // ======================================
    // Display style
    // ======================================

    const panel =
        document.getElementById(
            "practice-end-instruction"
        );


    panel.style.whiteSpace =
        "pre-line";


    panel.style.fontSize =
        "clamp(20px, 3.5vw, 32px)";


    // ======================================
    // Automatic continuation after 15 s
    // ======================================

    timer =
        setTimeout(
            resume,
            CONFIG.blockRestDuration
        );

}
// ======================================
// Practice end instruction
// ======================================

function showPracticeEndInstruction(message, onContinue){
    // 等待触摸时不再接受上一 trial 的反应。
    responseEnabled = false;
    currentResponseFunction = null;
    hideStimulus();
    document.getElementById("fixation").style.display = "none";

    let instruction = document.createElement("div");
    instruction.id = "practice-end-instruction";
    instruction.textContent = message;
    Object.assign(instruction.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        width: "90%",
        color: "white",
        fontSize: "36px",
        fontWeight: "bold",
        lineHeight: "1.5",
        textAlign: "center",
        zIndex: "1000",
        pointerEvents: "none"
    });
    document.body.appendChild(instruction);
    document.getElementById("response-area").style.display = "flex";

    prepareInstruction(onContinue);
}

// ======================================
// Response listener
// ======================================

function handleResponseTouch(event, side, button){
    event.preventDefault();
    if(pendingContinue){
        const onContinue = pendingContinue;
        pendingContinue = null;
        responseEnabled = false;
        currentResponseFunction = null;
        ["instruction-screen", "practice-end-instruction"].forEach(id=>{
            const element = document.getElementById(id);
            if(element) element.remove();
        });
        onContinue();
        // This touch belongs only to the instruction, never to a trial.
        return;
    }
    if(responseEnabled && currentResponseFunction){
        currentResponseFunction(side, button);
    }
}

["left", "right"].forEach(side=>{
    const button = document.getElementById(side+"-response");
    if(window.PointerEvent){
        button.addEventListener("pointerdown", function(event){
            if(!event.isPrimary || event.button !== 0) return;
            handleResponseTouch(event, side, this);
        }, {passive:false});
    }else{
        button.addEventListener("touchstart", function(event){
            handleResponseTouch(event, side, this);
        }, {passive:false});
    }
});

// One physical keydown is consumed by instructions/rest only. Held-key repeats
// cannot leak into the next trial, even after the 500 ms fixation.
const heldResponseKeys = new Set();
document.addEventListener("keydown", event=>{
    const side = event.key === "ArrowLeft" ? "left" : event.key === "ArrowRight" ? "right" : null;
    if(!side || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName) || event.target?.isContentEditable) return;
    event.preventDefault();
    if(event.repeat || heldResponseKeys.has(event.key)) return;
    heldResponseKeys.add(event.key);
    handleResponseTouch(event, side, document.getElementById(side+"-response"));
});
document.addEventListener("keyup", event=>heldResponseKeys.delete(event.key));
window.addEventListener("blur", ()=>heldResponseKeys.clear());
// ======================================
// Hide stimulus
// ======================================


function hideStimulus(){


    let stimulus =
    document.getElementById(
        "stimulus"
    );



    if(stimulus){


        stimulus.style.display =
        "none";


    }


}



async function finalizeSSTDatabase(){

    try{

        /*
            等待所有 trial 上传结束。

            注意：
            这里不会阻塞实验过程，
            只发生在实验已经结束以后。
        */

        await Promise.allSettled(
            pendingDatabaseOperations
        );


        /*
            所有 trial 上传尝试结束后，
            再标记 session completed。
        */

        const completed =
            await completeSSTSession();


        if(completed){

            console.log(
                "Supabase: all SST uploads finished, session completed."
            );

        }
        else{

            console.warn(
                "Supabase: SST session could not be completed. " +
                "Please keep the local CSV backup."
            );

        }

    }
    catch(error){

        console.error(
            "SST database finalization error:",
            error
        );

    }

}





// ======================================
// Experiment end
// ======================================


function endExperiment(){

    responseEnabled =
        false;

    currentResponseFunction =
        null;

    pendingContinue =
        null;


    hideStimulus();


    document
        .getElementById(
            "response-area"
        )
        .style.display =
            "none";


    console.log(
        "Experiment finished"
    );


    console.table(
        allData
    );



// ========================================================
// Finalize Supabase in background
//
// Wait for all trial uploads first,
// then mark the session as completed.
// Do not await here so the end screen appears immediately.
// ========================================================

    finalizeSSTDatabase();


    // ========================================================
    // End screen
    // ========================================================

    document
        .getElementById(
            "experiment"
        )
        .insertAdjacentHTML(
            "beforeend",

    `
    <div style="
        color:white;
        text-align:center;
        margin-top:22vh;
        font-family:Arial, 'Microsoft YaHei', sans-serif;
    ">

        <div style="
            font-size:40px;
            margin-bottom:36px;
        ">
            实验结束，谢谢参与！
        </div>

        <button
            id="download-sst-button"
            style="
                padding:16px 36px;
                font-size:24px;
                font-weight:bold;
                border:2px solid white;
                border-radius:6px;
                background-color:rgb(100,100,100);
                color:white;
                cursor:pointer;
                touch-action:manipulation;
            "
        >
            下载数据
        </button>

    </div>
    `
        );


    document
        .getElementById(
            "download-sst-button"
        )
        .addEventListener(
            "click",
            function(){

                exportCSV(
                    allData,
                    subjectID
                );

            }
    );
}