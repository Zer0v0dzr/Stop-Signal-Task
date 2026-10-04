// ===========================
// Supabase
// ===========================

const SUPABASE_URL =
    "https://sxvtbwtitdbaflaigahj.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9LVOphB0mpLVwN5x6qLCLA_ha1Z5DH6";


// ===========================
// SST Version
// ===========================

const TASK_VERSION =
    "1.0";


// ===========================
// SST Experiment Parameters
// ===========================

const CONFIG = {

    // 时间

    fixationDuration: 500,

    stimulusDuration: 1500,

    maxResponseTime: 1000,


    // Trial

    practiceTrials: 10,

    blocks: 4,

    trialsPerBlock: 50,

    stopTrialsPerBlock: [
        12,
        13,
        12,
        13
    ],

    blockRestDuration: 15000,


    // Staircase

    initialSSD: 200,

    stepSSD: 50,

    minSSD: 50,

    maxSSD: 950

};
