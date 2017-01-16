// Generated by CoffeeScript 1.3.1
var completion, gexf, ids;

jQuery.fn.disableTextSelect = function() {
  return this.each(function() {
    if (typeof this.onselectstart !== "undefined") {
      return this.onselectstart = function() {
        return false;
      };
    } else if (typeof this.style.MozUserSelect !== "undefined") {
      return this.style.MozUserSelect = "none";
    } else {
      this.onmousedown = function() {
        return false;
      };
      return this.style.cursor = "default";
    }
  });
};

ids = 0;

completion = {};

gexf = "";

$(document).ready(function() {
  var cache, closeBox, collectFilters, loadGraph, popfilter, xhrs;
  log("document ready.. installing whoswho");
  loadGraph = function(g) {
    gexf = g;
    log("url query: " + g);
    log("injecting applet");
    if ($('#frame').length === 0) {
      return $("#visualization").html("<iframe src=\"tinaframe.html" + (location.search != null ? location.search : '') + "\" class=\"frame\" border=\"0\" frameborder=\"0\" scrolling=\"no\" id=\"frame\" name=\"frame\"></iframe>");
    } else {
      return log("applet already exists");
    }
  };


  // small filter closing function
  closeThisBox = function() {
    var targetId = this.getAttribute("for")
    if (targetId) {
        var tgtBox = document.getElementById(targetId)
        // start transition
        tgtBox.style.opacity = 0
        // remove box
        setTimeout(function(){tgtBox.remove()}, 500)
        return true
    }
    else {
        console.warn('closeThisBox: no @for attribute!')
        return false
    }
  }

  // autocomplete
  popfilter = function(label, type, options) {
    var footer, header, id, id1, id2, input, closebox, labelization;
    id = ids++;
    id1 = "filter" + id;
    id2 = "combo" + id;
    id3 = "close" + id;
    header = "<li id=\"" + id1 + "\" class=\"filter\" style=\"padding-top: 5px;\">";
    labelization = "<span style=\"color: #fff;\">&nbsp; " + label + " </span>";
    input = "<input type=\"text\" id=\"" + id2 + "\" class=\"medium filter" + type + "\" placeholder=\"" + type + "\" />";
    closebox = "<div id=\""+id3+"\" for=\""+id1+"\" class=\"filter-close operation\">x</div>"
    footer = "</li>;";
    $(header + labelization + input + closebox + footer).insertBefore("#refine");
    $('#' + id3).click(closeThisBox)

    console.log("whoswho.popfilter: adding autocomplete menu", $("#" + id1))

    $("#" + id2).autocomplete({
        source: function (req, resp) {
            $.ajax({
                dataType: "json",
                type: "GET",
                url: "/search_filter.php",
                data: {
                    "category": type,
                    "term": req.term,
                },
                success: function(data){
                    resp(data.results)
                },
                error: function(response) {
                    console.log("ERROR from search_filter AJAX", response)
                }
            }) ;
        },
        minLength: 2
    })

    $("" + id1).hide();
    show("#" + id1);
    $("#" + id2).focus();
    return false;
  };
  // jQuery(".unselectable").disableTextSelect();
  jQuery(".unselectable").disableSelection();
  $(".unselectable").hover((function() {
    return $(this).css("cursor", "default");
  }), function() {
    return $(this).css("cursor", "auto");
  });
  hide("#search-form");
  $(".topbar").hover((function() {
    return $(this).stop().animate({
      opacity: 0.98
    }, "fast");
  }), function() {
    return $(this).stop().animate({
      opacity: 0.93
    }, "fast");
  });


  $.widget("custom.scholarcomplete", $.ui.autocomplete, {
    _renderMenu: function(ul, items) {
      var categories, self;
      self = this;
      categories = _.groupBy(items, function(o) {
        return o.category;
      });
      return _.each(categories, function(data, category) {
        var fullname, size, term, total;
        size = 0;
        total = 0;
        term = "";
        fullname = "";
        _.each(data, function(item) {
          var firstname, lastname, myRender;
          size = item.size;
          total = item.total;
          term = item.term;
          firstname = $.trim(item.firstname);
          lastname = $.trim(item.lastname);
          fullname = $.trim("" + firstname + " " + lastname);
          myRender = function(a, b) {
            return $("<li></li>").data("item.autocomplete", b).append($("<a></a>").text(fullname)).appendTo(a);
          };
          return myRender(ul, item);
        });
        ul.append("<li class='ui-autocomplete-category'>" + size + "/" + total + " people</li>");
        return ul.highlight(term);
      });
    }
  });
  $("#addfiltercountry").click(function() {
    return popfilter("in", "countries", []);
  });
  $("#addfilterorganization").click(function() {
    return popfilter("from", "organizations", []);
  });
  $("#addfilterlaboratory").click(function() {
    var prefix;
    prefix = "working";
    return popfilter("" + prefix + " at", "laboratories", []);
  });
  $("#addfilterkeyword").click(function() {
    var prefix;
    prefix = "working";
    return popfilter("" + prefix + " on", "keywords", []);
  });
  $("#addfiltertag").click(function() {
    return popfilter("tagged", "tags", []);
  });
  $("#register").click(function() {
    return window.open("/services/user/register/");
  });
  $("#searchname").scholarcomplete({
    minLength: 2,
    source: function(request, response) {
      log("searchname: " + request.term);
      return $.getJSON("search_scholar.php", {
        category: "login",
        login: request.term
      }, function(data, status, xhr) {
        log("results: " + data.results);
        return response(data.results);
      });
    },
    select: function(event, ui) {
      console.log(ui.item);
      if (ui.item != null) {
        console.log("Selected: " + ui.item.firstname + " aka " + ui.item.id);
        delay(100, function() {
          return $("#searchname").attr("value", ui.item.firstname + " " + ui.item.lastname);
        });
        $("#searchname").attr("placeholder", "");
        $("#print2").click(function() {
          console.log("clicked on print");
          return window.open("/print_scholar_directory.php?query=" + ui.item.id, "Scholar's list");
        });
        $("#generate2").click(function() {
          hide(".hero-unit");
          return $("#welcome").fadeOut("slow", function() {
            show("#loading", "fast");
            return window.location.href='/explorerjs.html?type="uid"&nodeidparam="' + ui.item.id + '"';
            //return loadGraph("get_scholar_graph.php?login=" + ui.item.id);
          });
        });
      }
      return "" + ui.item.firstname + " " + ui.item.lastname;
    }
  });


  // main form collect function
  collectFilters = function(cb) {
    var collect, query;
    collect = function(k) {
      var t;
      t = [];
      log("collecting .filter:" + k);
      $(".filter" + k).each(function(i, e) {
        var value;

        console.log('collecting (filter '+k+') from elt:' + e)

        value = $(e).val();
        if (value != null && value != "") {
          log("got: " + value);
          value = $.trim(value);
          log("sanitized: " + value);
          if (value !== " " || value !== "") {
            log("keeping " + value);
            return t.push(value);
          }
        }
      });
      return t;
    };
    log("reading filters forms..");


    query = {

    // TODO in the future multiple categories
    // categorya: $.trim($("#categorya :selected").text()),
    // categoryb: $.trim($("#categoryb :selected").text()),

    // TODO in the future coloredby
    // query.coloredby =  []

    }

    for (filterName of ["keywords", "countries", "laboratories", "tags", "organizations"]) {
        var filterValuesArray = collect(filterName)

        // we add only if something to add :)
        if (filterValuesArray.length) {
            query[filterName] = filterValuesArray
        }
    }

    log("raw query: ");
    log(query);

    query = encodeURIComponent(JSON.stringify(query));

    console.log("calling callback with encoded query:", query)
    return cb(query);
  };


  // refine filters => tinawebjs graphexplorer
  $("#generate").click(function() {
    console.log("clicked on generate")
    hide(".hero-unit");
    $("#welcome").fadeOut("slow");
    console.log("initiating graphexplorer")
    show("#loading", "fast");
    return collectFilters(function(query) {
      return window.location.href='/explorerjs.html?type="filter"&nodeidparam="' + escape(query) +'"';
      //return loadGraph("getgraph.php?query=" + query);
    });
  });
  $("#print").click(function() {
    console.log("clicked on print");
    return collectFilters(function(query) {
      console.log("collected filters: " + query);
      return window.open("/print_directory.php?query=" + query, "Scholar's list");
    });
  });
  hide("#loading");
  cache = {};
  return xhrs = {};
});
