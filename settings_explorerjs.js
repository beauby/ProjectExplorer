'use strict;'

var TW = {}

TW.conf = (function(TW){

  let TWConf = {}

  TWConf.branding = 'ProjectExplorer'   // <--- the name displayed in upper left


  // ==========================
  // TINA POSSIBLE DATA SOURCES
  // ==========================

  // Graph data source
  // -----------------
  // the graph input depends on TWConf.sourcemode (or manual url arg 'sourcemode')
  TWConf.sourcemode = "api"   // accepted: "api" | "serverfile" | "servermenu" | "localfile"

  // server-side .gexf|.json default source
  TWConf.sourceFile = "data/politoscope/ProgrammeDesCandidats.enrichi.gexf"

  // ...or server-side gexf default source list
  TWConf.sourceMenu = "db.json"

  // ...or remote bridge to default source api ajax queries
  TWConf.sourceAPI={};
  TWConf.sourceAPI["forNormalQuery"] = "services/api/graph";
  TWConf.sourceAPI["forFilteredQuery"] = "services/api/graph";


  // Related documents (topPapers) data source
  // -----------------------------------------

  TWConf.getRelatedDocs = true
  TWConf.relatedDocsAPI = "http://127.0.0.1:5000/twitter_search"


  // £TODO : allow to choose between twitter or elasticsearch topPapers (choic of post-process function in extras_explorer)
  // TWConf.relatedDocsType


  // =======================
  // DATA FACETS AND LEGENDS
  // =======================
  // to process node attributes values from data
  //    => colors   (continuous numeric attributes)
  //    => clusters (discrete numeric or str attributes),

  // create facets ?
  TWConf.scanClusters = true

  // facetOptions: choose here the visual result of your node attributes
  // -------------------------------------------------------------------
  // 3 possible coloring functions
  //   - cluster   (contrasted colors for attributes describing *classes*)
  //   - gradient  (uniform map from a numeric attribute to red/yellow gradient)
  //   - heatmap   (from blue to red, centered on a white "neutral" color)
  // 3 possible binning modes
  //   - 'samerange':  constant intervals between each bin
  //   - 'samepop':    constant cardinality inside each class (~ quantiles)
  //   - 'off'  :       no binning (each distinct value will be a legend item)
  TWConf.facetOptions = {

    //      gexf       |                 |  custom  |
    //    attribute    |    coloring     |  number  |    binning
    //      title      |    function     |  of bins |     mode
    // --------------------------------------------------------------------
    'age'             : {'col': "gradient", 'n': 4,  'binmode': 'samerange'},
    'growth_rate'     : {'col': "heatmap",  'n': 5,  'binmode': 'samepop'  },
    'PageRank'        : {'col': "gradient", 'n': 4,  'binmode': 'samerange'  },
    'numuniform'      : {'col': "heatmap",  'n': 7,  'binmode': 'samepop'  },
    'numpareto'       : {'col': "gradient", 'n': 5,  'binmode': 'samerange'},
    'intfewvalues'    : {'col': "cluster" , 'n': 4,  'binmode': 'samerange'},
    'Modularity Class': {'col': "cluster",           'binmode': 'off'},  // <== exemple with no binning
    'countryuniform'  : {'col': "cluster" ,          'binmode': 'off'},
    'countrypareto'   : {'col': "cluster" ,          'binmode': 'off'},
  }

  // NB  other cases with no binning:
  //     - if data type is not numeric
  //     - if there is less than distinct values that facetOptions[attr][n]


  // NB for heatmapColoring:
  //     - you should prefer odd number of bins
  //     - if the number of bins is even, the 2 classes in the middle get white
  //     - the maximum number of bins is 24

  // other POSS option: display attribute value in label or not ?



  // default clustering attribute (<---> used for initial node colors)
  TWConf.nodeClusAtt = "modularity_class"


  // to normalize node sizes: (NB not very useful because tina normalizes them at display)
  TWConf.desirableNodeSizeMin=1;
  TWConf.desirableNodeSizeMax=12;


  // =============
  // TINA BEHAVIOR
  // =============

  // Node typology (searched in nodes data, overridden if data has other types)

  // (FIXME cf. comment in sortNodeTypes and swActual functions
  //            about the limits of how these 2 values and
  //            TW.categories are used in older functions)
  TWConf.catSoc = "Document";
  TWConf.catSem = "NGram";

  // Active modules
  // --------------
  TWConf.ModulesFlags = {} ;
  // flag name is div class to be removed if false
  //        *and* subdirectory to import if true
  // see also activateModules()
  TWConf.ModulesFlags["histogramModule"] = false ;
  TWConf.ModulesFlags["histogramDailyVariantModule"] = false ;
  // TODO more generic module integrating the variants cf. experiments/histogramModule_STUB_GENERIQUE
  TWConf.ModulesFlags["crowdsourcingModule"] = true ;


  // Other optional functionalities
  // -----------------------------
  TWConf.filterSliders = true     // show sliders for nodes/edges subsets

  TWConf.clusterColorsAtt = true;      // show "Set colors" menu

  TWConf.deselectOnclickStage = true   // click on background remove selection ?
                                       // (except when dragging)

  TWConf.histogramStartThreshold = 10 ;   // for daily histo module
                                          // (from how many docs are significant)


  // £TODO these exist only in git branches
  //       (geomap: ademe, timeline: tweetoscope)
  //       ==> ask if need to be restored
  // TW.geomap = false;
  // TW.twittertimeline = false;

  // Layout options
  // --------------
  TWConf.fa2Available=true;        // show/hide fa2Button
  TWConf.disperseAvailable=true;   // show/hide disperseButton

  // if fa2Available, the auto-run config:

    TWConf.fa2Enabled= true;        // fa2 auto-run at start and after graph modified ?
    TWConf.fa2Milliseconds=5000;    // duration of auto-run
    TWConf.minNodesForAutoFA2 = 5   // graph size threshold to auto-run


  // Full-text search
  // ----------------
  TWConf.maxSearchResults = 10;           // how many "top papers" to display
  TWConf.minLengthAutoComplete = 1;       // how many chars to type for autocomp
  TWConf.strSearchBar = "Select topics";


  // ===================
  // RENDERING SETTINGS
  // ===================
  TWConf.twRendering = true ;     // false: use sigma "stock" rendering
                                  // true:  use our rendering customizations
                                  //        (nodes with borders,
                                  //         edges with curves,
                                  //         better labels, etc)

  TWConf.overSampling = true      // hi-def rendering (true => pixelRatio x 2)

  // sigma rendering settings
  // ------------------------
  TWConf.sigmaJsDrawingProperties = {
      // nodes
      defaultNodeColor: "#333",
      twNodeRendBorderSize: 1,           // node borders (only iff ourRendering)
      twNodeRendBorderColor: "#222",

      // edges
      minEdgeSize: 2,                    // in fact used in tina as edge size
      defaultEdgeType: 'curve',          // 'curve' or 'line' (curve only iff ourRendering)
      twEdgeDefaultOpacity: 0.4,         // initial opacity added to src/tgt colors

      // labels
      font: "Droid Sans",                // font params
      fontStyle: "bold",
      defaultLabelColor: '#000',         // labels text color
      labelSizeRatio: 1,                 // initial label size (on the slider)
      labelThreshold: 5,                 // min node cam size to start showing label
                                         // (old tina: showLabelsIfZoom)

      // hovered nodes
      defaultHoverLabelBGColor: '#fff',
      defaultHoverLabelColor: '#000',
      borderSize: 2.5,                   // for ex, bigger border when hover
      nodeBorderColor: "node",           // choices: 'default' color vs. node color
      defaultNodeBorderColor: "black",   // <- if nodeBorderColor = 'default'


      // selected nodes <=> special label
      twSelectedColor: "default",     // "node" for a label bg like the node color,
                                   // "default" for note-like yellow

      // not selected <=> grey
      twNodesGreyOpacity: .35,                       // smaller value: more grey
      twBorderGreyColor: "rgba(100, 100, 100, 0.5)",
      twEdgeGreyColor: "rgba(150, 150, 150, 0.5)",
  };
  // NB: sigmaJsDrawingProperties are available as 'settings' in all renderers
  // cf. https://github.com/jacomyal/sigma.js/wiki/Settings#renderers-settings


  // tina environment rendering settings
  // -----------------------------------
  // mouse captor zoom limits
  TWConf.zoomMin = .015625         // for zoom IN   (ex: 1/64 to allow zoom x64)
  TWConf.zoomMax = 2               // for zoom OUT

  // circle selection cursor
  TWConf.circleSizeMin = 0;
  TWConf.circleSizeMax = 100;

  // size range for neighbor nodes "tagcloud"
  TWConf.tagcloudFontsizeMin = 12;
  TWConf.tagcloudFontsizeMax = 24;

  TWConf.tagcloudSameLimit = 50     // max displayed neighbors of the same type
  TWConf.tagcloudOpposLimit = 10    // max displayed neighbors of the opposite type

  // relative sizes (iff ChangeType == both nodetypes)
  TWConf.sizeMult = [];
  TWConf.sizeMult[0] = 1.5;    // ie for node type 0
  TWConf.sizeMult[1] = 1.0;    // ie for node type 1



  // ===========
  // DEBUG FLAGS
  // ===========
  TWConf.debug = {
    initialShowAll: false,           // show all nodes on bipartite case init (docs + terms in one view)

    // show verbose console logs...
    logFetchers: false,              // ...about ajax/fetching of graph data
    logParsers: false,               // ...about parsing said data
    logFacets: false,                // ...about parsing node attribute:value facets
    logSettings: false,              // ...about settings at Tina and Sigma init time
    logSelections: false
  }


  // £TODO: fix these 2 settings with a better dir structure
  //        + but avoid path injection
  //        + find a place for modules *INSIDE* tinawebJS dir for easier deployment
  TWConf.ModulesPath = ''
  TWConf.libspath = 'libs'


  return TWConf
})()
