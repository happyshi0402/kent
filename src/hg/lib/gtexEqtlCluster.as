table gtexEqtlCluster
"BED5+ of eQTLs (variants affecting gene expression) with a target (gene or tissue), and lists of secondary targets (e.g. tissues or genes)
    (
    string chrom;      "Reference sequence chromosome or scaffold"
    uint   chromStart; "Start position in chromosome"
    uint   chromEnd;   "End position in chromosome"
    string name;       "Name of variant (rsID or GTEx identifier if none)"
    uint   score;      "Score from 0-1000"
    string target;     "Name of target (gene or tissue)
    uint expCount;     "Number of experiment values"
    string[expCount] expNames; "Comma separated list of experiment names (e.g. tissue or gene)"
    float[expCount] expScores; "Comma separated list of effect size values"
    float[expCount] expProbs; "Comma separated list of probability variant is in causal set"
    )
