/*
 * Customize as you want ;)
 */

// = = = = = = = = = = = [ Clusters Plugin ] = = = = = = = = = = = //
// Execution:    changeGraphAppearanceByFacets( true )
// It reads scanned node-attributes and prepared legends in TW.Clusters
//  to add the button in the html with the sigmaUtils.gradientColoring(x) listener.
function changeGraphAppearanceByFacets( manualflag ) {

    if ( !isUndef(manualflag) && !TW.conf.colorByAtt ) TW.conf.colorByAtt = manualflag;
    if(!TW.conf.colorByAtt) return;

    // settings to function name
    var colorFuns = {
      'heatmap': "heatmapColoring",
      'gradient': "gradientColoring",
      'cluster': "clusterColoring"
    }

    let currentNbNodes = TW.partialGraph.graph.nNodes()

    // create colormenu
    var color_menu_info = '<li><a href="#" onclick="graphResetColor()">By Default</a></li>';

    if( $( "#colorgraph-menu" ).length>0 ) {

      var actypes = getActivetypes()
      for (var tid in actypes) {
        let ty = actypes[tid]

        // each facet family or clustering type was already prepared
        for (var attTitle in TW.Clusters[ty]) {


          // attribute counts: nb of classes
          // POSS here distinguish [ty][attTitle].classes.length and ranges.length
          var attNbClasses = TW.Clusters[ty][attTitle].length
          var attNbNodes = currentNbNodes

          if (attNbClasses) {
            let lastClass = TW.Clusters[ty][attTitle][attNbClasses-1]
            if (lastClass.labl && lastClass.labl == '_non_numeric_' && lastClass.nids) {
              if (lastClass.nids.length) {
                attNbNodes -= lastClass.nids.length
              }
              else {
                attNbClasses -= 1
              }
            }
          }

          // coloringFunction
          var colMethod

          // read from user settings
          if (TW.conf.facetOptions[attTitle] && TW.conf.facetOptions[attTitle]['col']) {
            colMethod = colorFuns[TW.conf.facetOptions[attTitle]['col']]
          }

          // fallback guess-values
          if (! colMethod) {
            if(attTitle.indexOf("clust")>-1||attTitle.indexOf("class")>-1) {
              // for classes and clusters
              colMethod = "clusterColoring"
            }
            else {
              colMethod = "gradientColoring"
            }
          }

          // family label :)
          var attLabel ;
          if (attTitle == 'clust_louvain') {
            attLabel = 'Groupes de voisins, méthode de Louvain'
          }
          else if (TW.conf.facetOptions[attTitle] && TW.conf.facetOptions[attTitle]['menutransl']) {
            attLabel = TW.conf.facetOptions[attTitle]['menutransl']
          }
          else attLabel = attTitle

          color_menu_info += `<li><a href="#" onclick='${colMethod}("${attTitle}")'>By ${attLabel} (${attNbClasses} | ${attNbNodes})</a></li>`
        }

        // POSS add cumulated degree via TW.partialGraph.graph.degree(nid)
      }

      // we also add clust_louvain in all cases
      color_menu_info += `<li><a href="#" onclick='clusterColoring("clust_louvain")'>By Louvain clustering ( ? | ${currentNbNodes})</a></li>`

      // for debug
      // console.warn('color_menu_info', color_menu_info)

      $("#colorgraph-menu").html(color_menu_info)
    }

    // Legend slots were prepared in TW.Clusters

}

function RunLouvain() {

  var node_realdata = []
  var nodesV = getVisibleNodes()
  for(var n in nodesV)
    node_realdata.push( nodesV[n].id )

  var edge_realdata = []
  var edgesV = getVisibleEdges()
  for(var e in edgesV) {
    var st = edgesV[e].id.split(";")
    var info = {
        "source":st[0],
        "target":st[1],
        "weight":edgesV[e].weight
    }
    edge_realdata.push(info)
  }
    var community = jLouvain().nodes(node_realdata).edges(edge_realdata);
    var results = community();

    for(var i in results) {
      let n = TW.partialGraph.graph.nodes(i)
      if (n) {
        n.attributes["clust_louvain"] = results[i]
        // TW.Nodes[i].attributes["clust_louvain"]=results[i]
      }
    }
}



// Highlights nodes with given value using id map
// previously: highlighted nodes with given value using loop on node values
function SomeEffect( ValueclassCode ) {
    // console.debug("highlighting:", ValueclassCode )

    greyEverything();

    var nodes_2_colour = {};
    var edges_2_colour = {};


    // ex: ISItermsriskV2_140 & ISItermsriskV2_140::clust_default::7
    //       vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv          vvvvv      v
    //                     type                      Cluster key  class iClu
    //                                                (family)   (array index)
    var raw = ValueclassCode.split("::")
    var nodeType=raw[0],
        cluType=raw[1],
        iClu=Number(raw[2]);



    // £TODO factorizable: always the same loop for neighbors this should be handled by a sub of MultipleSelection2
    // get the active types code from current state (ie "1", "1|1", etc for TW.Relations lookup)
    var activetypesKey = getActivetypesKey()
    // console.log( "\t"+activetypesKey)

    // we have our precomputed idmaps for nodes_2_colour
    // -------------------------------------------------
    for (var k in TW.Clusters[nodeType][cluType][iClu].nids) {
      var nid = TW.Clusters[nodeType][cluType][iClu].nids[k]
      nodes_2_colour[nid] = true
    }

    for(var nid in nodes_2_colour) {
        n = TW.partialGraph.graph.nodes(nid)
        if(n) {
            // new sigma js: we change only flags, rendering will adapt color accordingly
            n.customAttrs['grey'] = false;

            // highlight (like neighbors but with no selection)
            n.customAttrs['highlight'] = true;
        }

        if(TW.Relations[activetypesKey] && TW.Relations[activetypesKey][nid] ) {
            neigh = TW.Relations[activetypesKey][nid]
            if(neigh) {
                for(j in neigh) {
                    tgt_nid = neigh[j]
                    if( !isUndef(nodes_2_colour[tgt_nid]) ) {
                        edges_2_colour[nid+";"+tgt_nid]=true;
                        edges_2_colour[tgt_nid+";"+nid]=true;
                    }
                }
            }
        }
    }


    for(var eid in edges_2_colour) {
        an_edge = TW.partialGraph.graph.edges(eid)
        if(!isUndef(an_edge) && !an_edge.hidden){
            // new sigma js: we change only flags, rendering will adapt color accordingly
            an_edge.customAttrs['grey'] = 0;
            an_edge.customAttrs['activeEdge'] = 1;
        }
    }

    TW.partialGraph.refresh()
}

function graphResetColor(){

    // reset global var
    TW.gui.handpickedcolor = false

    // reset each node's color and label
    for (var j in TW.nodeIds) {
      let n = TW.partialGraph.graph.nodes(TW.nodeIds[j])
      // as usual, n can be absent if not in current subset !
      if (n) {
        n.color = n.customAttrs["true_color"];

        n.customAttrs.alt_color = false
        n.customAttrs.altgrey_color = false

        n.label = TW.Nodes[n.id].label

        // some colorings also modified size
        n.size = TW.Nodes[n.id].size
      }

    }
    // if (TW.partialGraph.settings('drawEdges')) {
    //   for(var x in eds){
    //       e=eds[x];
    //       e.customAttrs["grey"] = 0;
    //       e.color = e.customAttrs["true_color"];
    //   }
    // }

    TW.partialGraph.render()
}


// @daclass: the name of a numeric/categorical attribute from node.attributes
// @groupingTicks: an optional threshold's array expressing ranges with their low/up bounds label and ref to matchin nodeIds
function set_ClustersLegend ( daclass, groupedByTicks ) {

    //TW.partialGraph.states.slice(-1)[0].LouvainFait = true

    $("#legend-for-clusters").removeClass( "my-legend" )
    $("#legend-for-clusters").html("")
    if(daclass==null) return;

    if (daclass=="clust_louvain")
        daclass = "louvain"

    var actypes = getActivetypes()

    // we have no specifications yet for colors (and legends) on multiple types
    if (actypes.length > 1) {
      console.warn("colors by bins will only color nodes of type 0")
    }
    // current display among TW.categories (ex: 'terms')
    var curType = actypes[0]

    // all infos in a bin array
    var legendInfo = []

    // sample node color
    var ClustNB_CurrentColor = {}

    // passed as arg   or  prepared in parseCustom
    if (!groupedByTicks && (!TW.Clusters[curType] || !TW.Clusters[curType][daclass])) {
      console.warn(`no class bins for ${daclass}, displaying no legend`)

      $("#legend-for-clusters").hide()
    }
    else {
      var LegendDiv = ""
      LegendDiv += `    <div class="legend-title">${daclass}</div>`
      LegendDiv += '    <div class="legend-scale">'
      LegendDiv += '      <ul class="legend-labels">'

      var legendInfo = groupedByTicks || TW.Clusters[curType][daclass]

      // valueclasses (values or intervals or classes) are already sorted in TW.Clusters
      for (var l in legendInfo) {

        // get a sample node color for each bin/class
        var nMatchedNodes = legendInfo[l]['nids'].length

        if (nMatchedNodes) {
          var midNid = legendInfo[l]['nids'][Math.floor(3*nMatchedNodes/4)]
          var exampleColor = TW.partialGraph.graph.nodes(midNid).color

          // create the legend item
          var preparedLabel = legendInfo[l]['labl']
          // console.log("preparedLabel", preparedLabel)

          // all-in-one argument for SomeEffect
          var valueclassId = `${curType}::${daclass}::${l}`

          var colorBg = `<span style="background:${exampleColor};"></span>`

          LegendDiv += `<li onclick='SomeEffect("${valueclassId}")'>`
          LegendDiv += colorBg + preparedLabel
          LegendDiv += "</li>\n"
        }
      }
      LegendDiv += '      </ul>'
      LegendDiv += '    </div>'

      $("#legend-for-clusters").addClass( "my-legend" );
      $("#legend-for-clusters").html( LegendDiv )
      $("#legend-for-clusters").show()
    }
}

// = = = = = = = = = = = [ / Clusters Plugin ] = = = = = = = = = = = //

// a custom variant of twitter plugin written for politoscope
// NB: this variant only for nodetype semantic
function getTopPapers(nodetypeLegacy){

    if (nodetypeLegacy == 'semantic' && TW.conf.getRelatedDocs) {

        jsonparams=getSelections();

        var joined_q = jsonparams.map(function(w) {return '('+w+')'}).join(' AND ')

        // console.log(jsonparams)
        // theHtml = "<p> jsonparams:"+jsonparams+" </p>"
        //
        $.ajax({
            type: 'GET',
            url: TW.conf.relatedDocsAPI,
            data: {'query': joined_q},
            contentType: "application/json",
            success : function(data){
                // console.log(data);

                var topTweetsHtml = ''

                if (data.length) {
                  for (var k in data) {
                    let tweetJson = data[k]
                    topTweetsHtml += RenderTweet(tweetJson)
                  }
                }
                else {
                  topTweetsHtml = `<p class="micromessage centered">The query <span class=code>${joined_q}</span> delivers no results on Twitter.</p>`
                }

                $("#topPapers").html(topTweetsHtml);
                $("#topPapers").show()
            },
            error: function(){
                console.log('Page Not found: getTopPapers');
            }
        });
    }
}

function clickInsideTweet(e, tweetSrcUrl) {
    console.debug('inside tweet tagName', e.target.tagName)
    var tgt = e.target
    if (tgt.tagName.toLowerCase() == "a")
        window.open(tgt.href, "Link in tweet")
    else
        window.open(tweetSrcUrl, "Source Tweet")
}

function RenderTweet( tweet) {

    var tweet_links = true

    var author_url = "http://twitter.com/"+tweet["user"]["screen_name"];
    var tweet_url = author_url+"/status/"+tweet["id_str"]
    var image_normal = author_url+"/profile_image?size=original";
    var image_bigger = "";
    if( tweet["user"]["profile_image_url"] ) {
        image_normal = tweet["user"]["profile_image_url"]
        image_bigger = tweet["user"]["profile_image_url"].replace("_normal","_bigger")
    }
    var html = ""
    html += '\t\t'+ '<blockquote onclick="clickInsideTweet(event, \''+tweet_url+'\')" class="Tweet h-entry tweet subject expanded" cite="'+tweet_url+'" data-tweet-id="'+tweet["id_str"]+'" data-scribe="section:subject">' + '\n';

    html += '\t\t\t'+ '<div class="Tweet-header u-cf">' + '\n';

    html += '\t\t\t\t'+ '<div class="Tweet-brand u-floatRight">' + '\n';

    html += '\t\t\t\t'+ '<span class="Tweet-metadata dateline">' + '\n';

    // TODO check datetime iso dates here
    html += '\t\t\t\t\t'+ '<a target="_blank" class="u-linkBlend u-url customisable-highlight long-permalink" data-datetime="2012-12-03T18:51:11+000" data-scribe="element:full_timestamp" href="'+tweet_url+'">' + '\n';
    html += '\t\t\t\t\t\t'+ '<time class="dt-updated" datetime="2012-12-03T18:51:11+0000" title="'+tweet["created_at"]+'">'+tweet["created_at"]+'</time>' + '\n';
    html += '\t\t\t\t\t'+ '</a>' + '\n';
    html += '\t\t\t\t'+ '</span>' + '\n';

    html += '\t\t\t\t\t'+ '<span class="u-hiddenInWideEnv">' + '\n';
    html += '\t\t\t\t\t\t'+ '<a target="_blank" href="'+tweet_url+'" data-scribe="element:logo">' + '\n';
    html += '\t\t\t\t\t\t\t'+ '<div class="Icon Icon--twitter " aria-label="" title="" role="presentation"></div>' + '\n';
    html += '\t\t\t\t\t\t'+ '</a>' + '\n';
    html += '\t\t\t\t\t'+ '</span>' + '\n';
    html += '\t\t\t\t'+ '</div>' + '\n';

    html += '\t\t\t\t'+ '<div class="Tweet-author u-textTruncate h-card p-author" data-scribe="component:author">' + '\n';
    html += '\t\t\t\t\t'+ '<a target="_blank" class="Tweet-authorLink Identity u-linkBlend" data-scribe="element:user_link" href="'+author_url+'">' + '\n';
    html += '\t\t\t\t\t\t'+ '<span class="Tweet-authorAvatar Identity-avatar">' + '\n';
    html += '\t\t\t\t\t\t\t'+ '<img class="Avatar u-photo" data-scribe="element:avatar" data-src-2x="'+image_bigger+'" src="'+image_normal+'">' + '\n';
    html += '\t\t\t\t\t\t'+ '</span>' + '\n';
    html += '\t\t\t\t\t\t'+ '<span class="Tweet-authorName Identity-name p-name customisable-highlight" data-scribe="element:name">'+tweet["user"]["name"]+'</span>' + '\n';
    html += '\t\t\t\t\t\t'+ '<span class="Tweet-authorScreenName Identity-screenName p-nickname" data-scribe="element:screen_name">@'+tweet["user"]["screen_name"]+'</span>' + '\n';

    html += '\t\t\t\t\t'+ '</a>' + '\n';
    html += '\t\t\t\t'+ '</div>' + '\n';
    html += '\t\t\t'+ '</div>' + '\n';

    html += '\t\t\t'+ '<div class="Tweet-body e-entry-content" data-scribe="component:tweet">' + '\n';

    html += '\t\t\t\t'+ '<p class="Tweet-text e-entry-title" lang="en" dir="ltr">' + tweet["text"] + '</p>' + '\n';

    if( !isUndef(tweet["retweet_count"]) || !isUndef(tweet["favourites_count"])  ) {
        html += '\t\t\t\t'+ '<ul class="Tweet-actions" data-scribe="component:actions" role="menu" aria-label="Tweet actions">' + '\n';
        if(tweet_links) {
            html += '\t\t\t\t\t'+ '<li class="Tweet-action">' + '\n';
            html += '\t\t\t\t\t\t'+ '<a target="_blank" class="TweetAction TweetAction--reply web-intent" href="https://twitter.com/intent/tweet?in_reply_to='+tweet["id_str"]+""+'" data-scribe="element:reply">' + '\n';
            html += '\t\t\t\t\t\t\t'+ '<div class="Icon Icon--reply TweetAction-icon" aria-label="Reply" title="Reply" role="img"></div>' + '\n';
            html += '\t\t\t\t\t\t'+ '</a>' + '\n';
            html += '\t\t\t\t\t'+ '</li>' + '\n';
        }

        if(!isUndef(tweet["retweet_count"])) {
            html += '\t\t\t\t\t'+ '<li class="Tweet-action">' + '\n';
            html += '\t\t\t\t\t\t'+ '<a target="_blank" class="TweetAction TweetAction--retweet web-intent" href="https://twitter.com/intent/retweet?tweet_id='+tweet["id_str"]+'" data-scribe="element:retweet">' + '\n';
            html += '\t\t\t\t\t\t\t'+ '<div class="Icon Icon--retweet TweetAction-icon" aria-label="Retweet" title="Retweet" role="img"></div>' + '\n';
            html += '\t\t\t\t\t\t\t'+ '<span class="TweetAction-stat" data-scribe="element:retweet_count" aria-hidden="true">'+tweet["retweet_count"]+'</span>' + '\n';
            html += '\t\t\t\t\t\t\t'+ '<span class="u-hiddenVisually">'+tweet["retweet_count"]+' Retweets</span>' + '\n';
            html += '\t\t\t\t\t\t'+ '</a>' + '\n';
            html += '\t\t\t\t\t'+ '</li>' + '\n';
        }

        if(!isUndef(tweet["favourites_count"])) {
            html += '\t\t\t\t\t'+ '<li class="Tweet-action">' + '\n';
            html += '\t\t\t\t\t\t'+ '<a target="_blank" class="TweetAction TweetAction--favorite web-intent" href="https://twitter.com/intent/favorite?tweet_id='+tweet["id_str"]+'" data-scribe="element:favorite">' + '\n';
            html += '\t\t\t\t\t\t\t'+ '<div class="Icon Icon--favorite TweetAction-icon" aria-label="Favorite" title="Favorite" role="img"></div>' + '\n';
            html += '\t\t\t\t\t\t\t'+ '<span class="TweetAction-stat" data-scribe="element:favourites_count" aria-hidden="true">'+tweet["favourites_count"]+'</span>' + '\n';
            html += '\t\t\t\t\t\t\t'+ '<span class="u-hiddenVisually">'+tweet["favourites_count"]+' favorites</span>' + '\n';
            html += '\t\t\t\t\t\t'+ '</a>' + '\n';
            html += '\t\t\t\t\t'+ '</li>' + '\n';
        }

        html += '\t\t\t\t'+ '</ul>' + '\n';
    }


    html += '\t\t\t'+ '</div>' + '\n';


    html += '\t\t'+ '</blockquote>' + '\n';
    // html += '\t\t'+ '<br>' + '\n';


    return html;
}

function getTips(){
    param='';

    text =
        "<br>"+
        "Basic Interactions:"+
        "<ul>"+
        "<li>Click on a node to select/unselect and get its information. In case of multiple selection, the button unselect clears all selections,</li>"+
        "<li> Use your mouse scroll to zoom in and out in the graph.</li>"+
        "</ul>"+
        "<br>"+
        "Graph manipulation:"+
        "<ul>"+
        "<li>Node size is proportional to the number of documents with the associated term,</li>"+
        "<li>Use the node filter to create a subgraph with nodes of a given size range (e.g. display only generic terms),</li>"+
        "<li>Link strength is proportional to the strenght of terms association,</li>"+
        "<li>Use the edge filter so create a subgraph with links in a given range (e.g. keep the strongest association).</li>"+
        "</ul>"+
        "<br>"+
        "Global/local view:"+
        "<ul>"+
        "<li>The 'change level' button allows to change between global view and node centered view,</li>"+
        "<li>To explore the neighborhood of a selection click on the 'change level' button.</li>"+
        "</ul>";

    $("#tab-container").hide();
    $("#tab-container-top").hide();
    return text;
}


// show Selector circle
// --------------------
// new sigma.js: could be replaced by default _moveHandler with bindings ?
//   => atm rewrote entire function with new values
function circleTrackMouse(e) {
    // new sigma.js 2D mouse context
    var ctx = TW.partialGraph.renderers[0].contexts.mouse;
    ctx.globalCompositeOperation = "source-over";

    // clear zone each time to prevent repeated frame artifacts
    ctx.clearRect(0, 0,
                  TW.partialGraph.renderers[0].container.offsetWidth,
                  TW.partialGraph.renderers[0].container.offsetHeight);

    // classic mousemove event or other similar non-sigma events
    x = sigma.utils.getX(e);
    y = sigma.utils.getY(e);

    // optional: make more labels appear on circle hover (/!\ costly /!\ esp. on large graphs)
    if (TW.conf.moreLabelsUnderArea) {
      // convert screen => mouse => cam
      var mouseCoords = sigma.utils.mouseCoords(e)
      var camCoords = TW.cam.cameraPosition(mouseCoords.x, mouseCoords.y)

      var exactNodeset = circleGetAreaNodes(
        camCoords.x,
        camCoords.y
      )
      // console.log("nodes under circle:", exactNodeset)

      // we'll use labelThreshold / 3 as the "boosted" cam:size threshold
      let pfx = TW.cam.readPrefix
      let toRedraw = []
      for (var k in exactNodeset) {
        let n = TW.partialGraph.graph.nodes(exactNodeset[k])
        if(n[pfx+'size'] > (TW.customSettings.labelThreshold / 3)) {
          toRedraw.push(n)
        }
      }
      redrawNodesInHoverLayer(toRedraw, "hovers")
    }

    // draw the circle itself
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.fillStyle = "#71C3FF";
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(x, y, TW.gui.circleSize, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1

}


// exact subset of nodes under circle
function circleGetAreaNodes(camX0, camY0) {

  var cursor_ray = TW.gui.circleSize * TW.cam.ratio // converting TW.gui.circleSize to cam units

  // prepare an approximate neighborhood
  var slightlyLargerNodeset = circleLocalSubset(
    camX0, camY0,
    cursor_ray
  )

  // console.log('slightlyLargerNodeset', slightlyLargerNodeset)

  var exactNodeset = []

  for(var i in slightlyLargerNodeset){
    n = slightlyLargerNodeset[i];
    if(!n.hidden){
      distance = Math.sqrt(
                  Math.pow((camX0-parseInt(n['read_cam0:x'])),2) +
                  Math.pow((camY0-parseInt(n['read_cam0:y'])),2)
      );

      // console.log('D[P0,'+n.label+'] =', distance)

      if( distance <= cursor_ray) {
        exactNodeset.push(n.id)
      }
    }
  }

  return exactNodeset
}


// returns set of nodes in the quad subzones around a square
//         that is containing the circle centered on x0, y0
// (use case: reduce number of nodes before exact check)
function circleLocalSubset(camX0, camY0 , camRay) {

  var P0 = {x:camX0, y:camY0}

  // to use quadtree.area, we consider the square
  // in which our circle is inscribed

  //                y-
  //
  //        P1 x----------x P2
  //           |          |
  // <= x-     |    P0    | 2r      x+ =>
  //           |          |
  //           x----------x
  //
  //                y+


  var P1 = {x: P0.x - camRay , y: P0.y - camRay }  // top left
  var P2 = {x: P0.x + camRay , y: P0.y - camRay }  // top right

  var areaNodes = TW.cam.quadtree.area({
                        height: 2 * camRay,
                        x1:P1.x,  y1:P1.y,
                        x2:P2.x,  y2:P2.y
                      })

  // neighborhood guaranteed a bit larger than the square
  // console.log('got ',areaNodes.length, 'nodes:', areaNodes)

  return areaNodes
}


// BASIC MODULARITY
// =================
// activateModules is for adding/removing features from TinawebJS
// each flag is simultaneously 3 things:
//   - the key of a bool config value in TW.conf.ModulesFlags (settings_explorerjs)
//   - the dirname of the submodule's files (with a mandatory init.js)
//   - the css class of all html elements added by the submodule
function activateModules() {
    for(var key in TW.conf.ModulesFlags) {

        if(TW.conf.ModulesFlags[key]===false) {
            $("."+key).remove() ; // hide elements of module's class
        }
        else {
            // console.log("extras:activateModules: key is true: "+key)
            // load JS+CSS items corresponding to the flagname
            let my_src_dir = key

            // synchronous ajax
            let moduleIsPresent = linkCheck(my_src_dir+"/init.js")

            if (moduleIsPresent) {
              loadJS(my_src_dir+"/init.js") ;
            }
            else {
              console.warn (`didn't find module dir ${key}`)
              $("."+key).remove()
            }
            // ex: for the flag = crowdsourcingTerms
            //     will load ==> JS    crowdsourcingTerms/init.js
            //               ==> other elements listed in init.js
            //                ├── "crowdsourcingTerms"+"/crowdTerms.css"
            //                └── "crowdsourcingTerms"+"/suggest.js"
        }
    }
}


// Settings edition
// =================
function fillAttrsInForm() {
  var actypes = getActivetypes()
  for (let tid in actypes) {
    let ty = actypes[tid]

    let elChooser = document.getElementById('choose-attr')

    // remove the possible previous options from possible previous graphs
    while (elChooser.lastChild) {
      elChooser.removeChild(elChooser.lastChild)
    }

    // each facet family or clustering type was already prepared
    for (let att in TW.Clusters[ty]) {
      let opt = document.createElement('option')
      opt.value = att
      opt.innerText = att
      elChooser.appendChild(opt)
    }
  }
}


function binmodeOpenNBins() {
  let mainq = document.getElementById('attr-binmode')
  let subq  = document.getElementById('attr-nbins-div')
  if (mainq.value == "samepop" || mainq.value == "samerange") {
    subq.style.display = 'block'
  }
  else {
    subq.style.display = 'none'
  }
}

function showAttrConf() {
  let attrTitle = this.value
  let settings = TW.conf.facetOptions[attrTitle]
  if (settings) {
    document.getElementById('attr-col').value = settings.col || 'gradient'
    document.getElementById('attr-binmode').value = settings.binmode || 'off'
    document.getElementById('attr-translation').value = settings.menutransl || attrTitle
    if(settings.n) {
      document.getElementById('attr-nbins-div').style.display = 'block'
      document.getElementById('attr-nbins').value = settings.n || 5
    }
  }
}


// writes new attribute configuration from user form AND recreates facet bins
// processing time: ~~ 1.5 ms for 100 nodes
function newAttrConf() {
  let attrTitle = document.getElementById('choose-attr').value

  // read values from GUI
  TW.conf.facetOptions[attrTitle] = {
     'col': document.getElementById('attr-col').value,
     'binmode': document.getElementById('attr-binmode').value,
     'n': document.getElementById('attr-nbins').value,
     'menutransl': document.getElementById('attr-translation').value
  }

  // find the corresponding types
  let relevantTypes = {}
  for (let ty in TW.Clusters) {
    if (TW.Clusters[ty][attrTitle]) {
      relevantTypes[ty] = true
    }
  }

  // reparse values (avoids keeping them in RAM since parseCustom)
  tmpVals = {}
  for (let nid in TW.Nodes) {
    let n = TW.Nodes[nid]
    if (relevantTypes[n.type]) {
      tmpVals = updateValueFacets(tmpVals, n, attrTitle)
    }
  }

  let newClustering = facetsBinning (tmpVals)

  // write result to global TW.Clusters
  for (let ty in newClustering) {
    TW.Clusters[ty][attrTitle] = newClustering[ty][attrTitle]
  }

  // update the GUI menu
  changeGraphAppearanceByFacets(true)

  // console.log("reparse raw result", tmpVals)
  // console.log("reparse binned result", newClustering)
}
