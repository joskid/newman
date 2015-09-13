/**
 * define base data url; service context
 * @type {string}
 */
var service_context = 'mediasearch2';

/**
 *  instantiate user-ale-logger
 */
/* disabled until required
var ale = new userale({
    loggingUrl: 'http://10.1.93.208', //The url of the User-ALE logging server.
    toolName: 'newman', //The name of your tool
    toolVersion: 'media', //The semantic version of your tool
    elementGroups: [ //A list of element groups used in your tool (see below)
        'user_search',
        'nav_bar',
        'posts_table',
        'sort_posts_table_column',
        'network_graph',
        'time_series_chart',
        'associated_users',
        'possible_alias',
        'hashtags',
        'content',
        'visual_selects',
        'visual_legends',
        'tab_select'
    ],
    workerUrl: 'plugins/user-ale/userale-worker.js', //The location of the User-ALE webworker file
    debug: false, //Whether to log messages to console
    sendLogs: false //Whether or not to send logs to the server (useful during testing)
});
ale.register();
*/

/**
 *  user-ale UI-event logging
 */
/* disabled until required
function logUIEvent( ui_activity,
                     ui_action,
                     element_ID,
                     element_type,
                     element_group ) {

    var msg = {
        activity: ui_activity,
        action: ui_action,
        elementId: element_ID,
        elementType: element_type,
        elementGroup: element_group,
        source: 'user',
        tags: [ 'show', 'select', 'sort', element_ID ]
    };
    console.log( 'logUIEvent: ' + ui_action + ' ' + element_ID);
    ale.log(msg);
}
*/

var dashboard_time_chart_outbound_activities;
var dashboard_time_chart_inbound_activities;
var dashboard_donut_chart_entities;
var dashboard_donut_chart_topic;
var dashboard_donut_chart_domain;
var dashboard_donut_chart_communities;

var service_response_email_domains;

/**
 * monthly account activity container
 */
/*
var account_activity = (function () {

  var account = '';
  var outbound_count = 0;
  var inbound_count = 0;

  var setAccount = function (new_account) {
    if (new_account > 0) {
      account = new_account;
    }
  };

  var getAccount = function () {
      return account;
  };

  var newOutbound = function (count) {
    if (count > 0) {
      outbound_count = outbound_count + count;
    }
  };

  var getOutbound = function () {
    return outbound_count;
  };

  var newInbound = function (count) {
    if (count > 0) {
      inbound_count = inbound_count + count;
    }
  };

  var getInbound = function () {
    return inbound_count;
  };

  return {
    "setAccount" : setAccount,
    "getAccount" : getAccount,
    "newOutbound" : newOutbound,
    "getOutbound" : getOutbound,
    "newInbound" : newInbound,
    "getInbound" : getInbound
  }

}());
*/

/**
 * monthly activity container
 */
/*
var activity_monthly = (function () {

  var date_start = 'default_min';
  var date_end = 'default_max';
  var outbound_monthly = [];
  var inbound_monthly = [];

  var account_activity = function (account, activity_count) {
    var _account = new_account;
    var _activity_count = new_activity( count );

    var new_activity = function( count ) {
      if (count > 0) {
        _activity_count = _activity_count + count;
      }
    }

    return {

    }
  };

  var newActivity = function (sender, receiver, activity_date, doc_id) {

  };

  var setDateStart = function (new_start) {
    date_start = new_start;
  };

  var getDateStart = function () {
    return date_start;
  };

  var setDateEnd = function (new_end) {
    date_end = new_end;
  };

  var getDateEnd = function () {
    return date_end;
  };



  return {
    "setDateMinText" : setDateMinText,
    "setDateMaxText" : setDateMaxText,
    "getDateMinText" : getDateMinText,
    "getDateMaxText" : getDateMaxText,
    "getDateRange" : getDateRange
  }

}());
*/

/**
 * date-time range container
 */
var date_range = (function () {

  var date_range_min_text = 'default_min';
  var date_range_max_text = 'default_max';

  var setDateMinText = function (new_min_text) {
    date_range_min_text = new_min_text;
  };

  var setDateMaxText = function (new_max_text) {
    date_range_max_text = new_max_text;
  };

  var getDateMinText = function () {
    return date_range_min_text;
  };

  var getDateMaxText = function () {
    return date_range_max_text;
  };

  var getDateRange = function () {
    return getDateMinText() + ',' + getDateMaxText();
  };

  return {
    "setDateMinText" : setDateMinText,
    "setDateMaxText" : setDateMaxText,
    "getDateMinText" : getDateMinText,
    "getDateMaxText" : getDateMaxText,
    "getDateRange" : getDateRange
  }

}());

/**
 * search result container
 */
var search_result = (function () {
  var result_set_max = 20;
  var result_set = [];
  var ui_appendable;

  var result = function( label,
                         search_text,
                         search_field,
                         description,
                         url,
                         data_source_id,
                         data_source_category,
                         document_count,
                         node_count ) {
    if (!label) {
      if (search_text) {
        label = search_text;
      }
      else {
        label = 'all';
      }
    }

    if (!description) {
      description = data_source_id + ", " + search_field;
    }

    var key = label.replace(' ', '_');

    return {
      "key" : key,
      "label" : label,
      "search_text" : search_text,
      "search_field" : search_field,
      "description" : description,
      "url" : url,
      "data_source_id" : data_source_id,
      "data_source_category" : data_source_category,
      "document_count" : document_count,
      "node_count" : node_count,
    }
  }

  var push = function ( label,
                        search_text,
                        search_field,
                        description,
                        url,
                        data_source_id,
                        data_source_category,
                        document_count,
                        node_count ) {
    console.log('push( ' + label + ', ' + search_text + ', ' + search_field + ', ' + url + ' )');

    var new_result = result( decodeURIComponent(label),
                             decodeURIComponent(search_text),
                             search_field,
                             description,
                             url,
                             data_source_id,
                             data_source_category,
                             document_count,
                             node_count );

    if (!contains(new_result)) {
      if (result_set.length == result_set_max) {
        result_set.splice(result_set.length - 1, 1);
      }
      result_set.unshift(new_result);

      //console.log( '\tappended \'' + label + '\'' );

      refreshUI();
    }

    return new_result;
  };

  var clearAll = function () {
    console.log('clearAll()');
    clearUI();
    result_set = [];
  }

  var pop = function () {
    return result_set.shift();
  };

  var contains = function (result) {

    var found = false;
    _.each(result_set, function (element) {

      if (element.url === result.url) {
        found = true;
      }

    });

    console.log('contains( ' + result.label + ' ) ' + found);

    return found;
  };

  var getFirst = function () {
    console.log('getFirst()');

    return result_set.pop();
  };

  var getAllResult = function () {
    return result_set;
  };

  var getResultByIndex = function (index) {
    return result_set[ index ];
  };

  var getResultByLabel = function ( label ) {
    //console.log( 'getResultByLabel(' + label + ')' );

    var result;
    _.each(result_set, function (element) {

      if (element.label === label) {
        result = element;
      }

    });

    return result;
  };

  var getResultByURL = function ( url ) {
    //console.log( 'getResultByURL(' + url + ')' );

    var result;
    _.each(result_set, function (element) {

      if (element.url === url) {
        result = element;
      }

    });

    return result;
  };

  var setUI = function( new_ui_appendable ) {
    ui_appendable = new_ui_appendable;
  }

  var refreshUI = function() {

    if (ui_appendable) {
      console.log('result_set[' + result_set.length + ']');

      clearUI();

      _.each(result_set, function (element) {
        //console.log('\t' + element.label + ', ' + element.url );

        var button = $('<button />', {
          type: 'button',
          class: 'btn btn-small outline',
          html: element.label,
          value: element.key,
          id: element.key,
          on: {
            click: function () {
              console.log( 'search-item-selected : ' + this.id);

              var label = ' all';
              if(element.search_text) {
                label = ' ' + decodeURIComponent(element.search_text);
              }
              var id = decodeURIComponent( element.url ).replace(/\s/g, '_').replace(/\\/g, '_').replace(/\//g, '_').replace(',','_');

              history_nav.push(id,
                               label,
                               '',
                               element.url,
                               element.search_field);

              showSearchPopup( element.search_field, element.search_text );
              loadSearchResult( element.url );
            }
          }
        });

        var div = $( '<div class=\"one-result\" />' )
          .append( button )
          .append(
          "<p class=\"txt-primary\">" + "    " +
          "<i class=\"fa fa-files-o fa-lg\"></i>" + "  document  " + element.document_count + "  " +
          "<i class=\"fa fa-user fa-lg\"></i>" + "  account  " + element.node_count + "  " +
          "</p>" +
          "<a href=\"" + element.url + "\" class=\"txt-primary\">" + "    " + element.description + " ... </a>"
          );

        ui_appendable.append( div );

      });
    }
  };

  var clearUI = function () {

    if(ui_appendable) {
      console.log('clearUI()');

      //ui_appendable.empty();

      ui_appendable.children().each(function () {
        $(this).remove();
      });


    }
  }

    return {
      "push": push,
      "pop": pop,
      "contains": contains,
      "getFirst": getFirst,
      "getAllResult": getAllResult,
      "getResultByIndex": getResultByIndex,
      "getResultByLabel" : getResultByLabel,
      "getResultByURL" : getResultByURL,
      "clearAll" : clearAll,
      "refreshUI" : refreshUI,
      "setUI" : setUI,
      "clearUI" : clearUI
    }
}());


/**
 * request and display top entity-related charts
 * @param count
 */
function drawChartEntity( count ) {

  var chart_ui_id = '#chart_horizontal_bar_entities';
  var legend_ui_id = '#chart_legend_entities';

  if (count > 0 && chart_ui_id) {

    var top_count = count;
    /*
    if (top_count > 5) {
      top_count = 5;
    }
    */

    $.get('entity/top/' + count).then(function (response) {

      $(chart_ui_id).empty();
      var legend_items = ["Person", "Location", "Organization", "Misc"];

      var legend = $('<div>').css('padding-top', '8px');
      _.each(legend_items, function (item) {
        legend.append($('<div>').css({
          'display': 'inline-block',
          'width': '20px',
          'height': '12px',
          'padding-left': '5px',
          'padding-right': '5px;'
        }).addClass(item.toLowerCase()))
          .append($('<span>').css({'padding-left': '5px', 'padding-right': '5px'}).text(item))
          .append($('<br/>'));
      });

      if (legend_ui_id) {
        $(legend_ui_id).append(legend);
      }

      var entities = response.entities;

      var width = 450, height_bar = 15, margin_top = 8, margin_bottom = 2;
      var margin = {top: margin_top, right: 10, bottom: margin_bottom, left: 100};
      width = width - margin.left - margin.right;

      var x = d3.scale.linear().range([0, width]);
      var chart = d3.select(chart_ui_id).append('svg')
        .attr('class', 'chart')
        .attr("width", width + margin.left + margin.right);

      x.domain([0, _.first(entities)[3]]);
      chart.attr("height", height_bar * entities.length + margin_top + margin_bottom);

      var bar = chart.selectAll("g")
        .data(entities).enter()
        .append("g")
        .attr("transform", function (d, i) {
          return "translate(" + margin.left + "," + (+(i * height_bar) + +margin.top) + ")";
        });

      bar.append("rect")
        .attr("width", function (d) {
          return x(+d[3]);
        })
        .attr("height", height_bar - 1)
        .attr("class", function (d) {
          return d[1];
        })
        .append('title').text(function (d) {
          return d[2];
        });

      bar.append("text")
        .attr("x", function (d) {
          return x(+d[3]) - 3;
        })
        .attr("y", height_bar / 2)
        .attr("dy", ".35em")
        .text(function (d) {
          return +d[3];
        });

      bar.append("text")
        .attr("x", function (d) {
          return -margin.left;
        })
        .attr("y", height_bar / 2)
        .attr("class", "label clickable")
        .on("click", function (d) {
          //do_search('entity', d[0], d[2]);
        })
        .text(function (d) {

          var max_length = 25;
          if (d[2].length > max_length) {
            var text = d[2].substr(0, max_length);
            text = text.substr( 0, text.lastIndexOf(' '));
            return text + " ...";
          }

          return d[2];

        })
        .append('title').text(function (d) {
          return d[2];
        });


      var top_donut_chart_data = [];
      var top_donut_chart_total = 1;
      var top_donut_chart_colors = [];


      for( var i = 0; i < top_count; i++ ){
        top_donut_chart_total = top_donut_chart_total + entities[i][3];
        var entity_type = entities[i][1];
        var entity_color = '#c0c0c0';
        if (entity_type === 'person') {
          entity_color = '#00ccff';
        }
        else if (entity_type === 'location') {
          entity_color = '#00ff00';
        }
        else if (entity_type === 'organization') {
          entity_color = '#ffcc33';
        }
        top_donut_chart_colors.push( entity_color );
      };

      for( var i = 0; i < top_count; i++ ){


        var value = Math.round((entities[i][3] / top_donut_chart_total) * 100);
        var entry = {
          value: value,
          label: entities[i][2],
          formatted: value + '%'
        };
        top_donut_chart_data.push(entry);
      };


      dashboard_donut_chart_entities = Morris.Donut({
        element: 'chart_donut_entities',
        data: top_donut_chart_data,
        colors: top_donut_chart_colors,
        formatter: function (x, data) { return data.formatted; }
      });

      dashboard_donut_chart_entities.select(0);

    });

  }
}

/**
 * request and display top topic-related charts
 * @param count
 */
function drawChartTopic( count ) {

  var chart_ui_id = '#chart_horizontal_bar_topics';

  if (count > 0 && chart_ui_id) {

    var top_count = count;
    /*
     if (top_count > 5) {
     top_count = 5;
     }
     */

    $.get('topic/category/all').then(function (response) {

      $(chart_ui_id).empty();

      var categories = _.map(response.categories.splice(0, count), function( element ){
        var category =  _.object(["index", "topics","score"], element);
        category.topics = _.take(category.topics.split(' '), 5).join(' ');
        category.score = parseFloat(category.score);
        return category;
      });

      /*
      _.each(categories, function (item) {
        console.log( 'index : ' + item.index + ' topics : ' + item.topics + " score : " + item.score );

      });
      */

      var colors = d3.scale.category20b();
      var width = 600, height_bar = 15, margin_top = 8, margin_bottom = 2, width_bar_factor = 7;
      var margin = {top: margin_top, right: 10, bottom: margin_bottom, left: 150};
      width = width - margin.left - margin.right;

      var x = d3.scale.linear().range([0, width]);
      var chart = d3.select(chart_ui_id).append('svg')
        .attr('class', 'chart')
        .attr("width", width + margin.left + margin.right);

      x.domain([0, 100]);
      chart.attr("height", height_bar * categories.length + margin_top + margin_bottom);

      var bar = chart.selectAll("g")
        .data(categories).enter()
        .append("g")
        .attr("transform", function (d, i) {
          return "translate(" + margin.left + "," + (+(i * height_bar) + +margin.top) + ")";
        });

      bar.append("rect")
        .attr("width", function (d) {
          return x(+d.score * width_bar_factor);
        })
        .attr("height", height_bar - 1)
        .attr("class", "label highlight clickable")
        .on("click", function (d) {
          console.log( 'clicked on \'' + d.topics + '\'');

        })
        .style("fill", function (d, i) {
          return colors(i);
        })
        .append('title').text(function (d) {
          return d.score;
        });


      bar.append("text")
        .attr("x", function (d) {
          return x(+d.score * width_bar_factor) - 3;
        })
        .attr("y", height_bar / 2)
        .attr("dy", ".35em")
        .text(function (d) {
          return +d.score;
        });


      bar.append("text")
        .attr("x", function (d) {
          return -margin.left;
        })
        .attr("y", height_bar / 2)
        .attr("class", "label clickable")
        .on("click", function (d) {
          console.log( 'clicked on \'' + d.topics + '\'');

        })
        .text(function (d) {
          var max_length = 30;
          if (d.topics.length > max_length) {
            var text = d.topics.substr(0, max_length);
            text = text.substr( 0, text.lastIndexOf(' '));
            return text + " ...";
          }

          return d.topics;
        })
        .append('title').text(function (d) {
          return d.topics;
        });


      var top_donut_chart_data = [];
      var top_donut_chart_total = 1;


      for( var i = 0; i < top_count; i++ ){
        top_donut_chart_total = top_donut_chart_total + categories[i].score;
      };

      for( var i = 0; i < top_count; i++ ){
        var value = Math.round((categories[i].score / top_donut_chart_total) * 100);
        var entry = {
          value: value,
          label: (_.take((categories[i].topics).split(' '), 3).join(' ')),
          formatted: value + '%'
        };
        top_donut_chart_data.push(entry);
      };


      dashboard_donut_chart_topic = Morris.Donut({
        element: 'chart_donut_topics',
        colors: colors.range(),
        data: top_donut_chart_data,
        formatter: function (x, data) { return data.formatted; }
      });

      dashboard_donut_chart_topic.select(0);

    });

  }
}

/**
 * request and display top domain-related charts
 * @param count
 */
function drawChartDomain( count ) {

  var chart_ui_id = '#chart_horizontal_bar_domains';
  var legend_ui_id = '#chart_legend_domains';

  if (count > 0 && chart_ui_id) {

    var top_count = count;
    /*
     if (top_count > 5) {
     top_count = 5;
     }
     */

    $.get('email/domains').then(function (response) {


      if(!service_response_email_domains) {
        console.log('searchtool: request service_response_email_domains');
        //validate service response
        service_response_email_domains = validateDomainResponse(response);
      }
      var filtered_response = service_response_email_domains;
      //console.log('\tfiltered_response: ' + JSON.stringify(filtered_response, null, 2));

      var domains = _.map(filtered_response.domains, function( element ){
        var domain =  _.object(["domain", "count"], element);
        return domain;
      });

      domains = domains.sort( descendingPredicatByProperty("count"));
      //console.log('domains: ' + JSON.stringify(domains, null, 2));

      if (domains.length > count) {
        domains = domains.splice(0, count);
      }

      /*
      _.each(domains, function (item) {
        console.log( 'domain : ' + item.domain + ' count : ' + item.count  );

      });
      */


      var colors = d3.scale.category20b();
      var width = 600, height_bar = 15, margin_top = 8, margin_bottom = 2, width_bar_factor = 1;
      var margin = {top: margin_top, right: 10, bottom: margin_bottom, left: 150};
      width = width - margin.left - margin.right;

      var x = d3.scale.linear().range([0, width]);
      var chart = d3.select(chart_ui_id).append('svg')
        .attr('class', 'chart')
        .attr("width", width + margin.left + margin.right);

      x.domain([0, 100]);
      chart.attr("height", height_bar * domains.length + margin_top + margin_bottom);

      var bar = chart.selectAll("g")
        .data(domains).enter()
        .append("g")
        .attr("transform", function (d, i) {
          return "translate(" + margin.left + "," + (+(i * height_bar) + +margin.top) + ")";
        });

      bar.append("rect")
        .attr("width", function (d) {
          return x(+d.count * width_bar_factor);
        })
        .attr("height", height_bar - 1)
        .attr("class", "label highlight clickable")
        .on("click", function (d) {
          console.log( 'clicked on \'' + d.domain + '\'');

        })
        .style("fill", function (d, i) {
          return colors(i);
        })
        .append('title').text(function (d) {
          return d.count;
        });


      bar.append("text")
        .attr("x", function (d) {
          return x(+d.count * width_bar_factor) - 3;
        })
        .attr("y", height_bar / 2)
        .attr("dy", ".35em")
        .text(function (d) {
          return +d.count;
        });


      bar.append("text")
        .attr("x", function (d) {
          return -margin.left;
        })
        .attr("y", height_bar / 2)
        .attr("class", "label clickable")
        .on("click", function (d) {
          console.log( 'clicked on \'' + d.domain + '\'');

        })
        .text(function (d) {
          var max_length = 30;
          if (d.domain.length > max_length) {
            var text = d.domain.substr(0, max_length);
            text = text.substr( 0, text.lastIndexOf(' '));
            return text + " ...";
          }

          return d.domain;
        })
        .append('title').text(function (d) {
          return d.domain;
        });


      var top_donut_chart_data = [];
      var top_donut_chart_total = 1;


      for( var i = 0; i < top_count; i++ ){
        top_donut_chart_total = top_donut_chart_total + domains[i].count;
      };

      for( var i = 0; i < top_count; i++ ){
        var value = Math.round((domains[i].count / top_donut_chart_total) * 100);
        var entry = {
          value: value,
          label: (_.take((domains[i].domain).split(' '), 3).join(' ')),
          formatted: value + '%'
        };
        top_donut_chart_data.push(entry);
      };


      dashboard_donut_chart_domain = Morris.Donut({
        element: 'chart_donut_domains',
        colors: colors.range(),
        data: top_donut_chart_data,
        formatter: function (x, data) { return data.formatted; }
      });

      dashboard_donut_chart_domain.select(0);

    });
  }
}

/**
 * request and display activity-related charts
 * @param count
 */
function draw_chart_account_activities( count ) {

  var chart_ui_id_text = 'chart_line_account_activities';
  var chart_ui_id_element = $('#' + chart_ui_id_text);

  if (count > 0 && chart_ui_id_element) {

    var top_count = count;
    /*
     if (top_count > 5) {
     top_count = 5;
     }
     */

    $.get('search/dates').then(function (response) {
      console.log('draw_chart_account_activities()');

      var doc_dates = response.doc_dates;

      var domains = _.map(doc_dates, function (element) {
        var domain = _.object(["domain", "count"], element);
        domain.count = parseInt(domain.count);
        return domain;
      });

      domains = domains.sort(descendingPredicatByProperty("count"));
      if (domains.length > count) {
        domains = domains.splice(0, count);
      }

      /*
       _.each(domains, function (item) {
       console.log( 'domain : ' + item.domain + ' count : ' + item.count  );

       });
       */


      dashboard_time_chart_outbound_activities = Morris.Line({
        element: 'chart_line_outbound_activities',
        data: [
          {period: '2010 Jan', user_0: 2666, user_1: null, user_2: 2647},
          {period: '2010 Apr', user_0: 2778, user_1: 2294, user_2: 2441},
          {period: '2010 Jul', user_0: 4912, user_1: 1969, user_2: 2501},
          {period: '2010 Sep', user_0: 3767, user_1: 3597, user_2: 5689},
          {period: '2011 Jan', user_0: 6810, user_1: 1914, user_2: 2293},
          {period: '2011 Apr', user_0: 5670, user_1: 4293, user_2: 1881},
          {period: '2011 Jul', user_0: 4820, user_1: 3795, user_2: 1588},
          {period: '2011 Sep', user_0: 15073, user_1: 5967, user_2: 5175},
          {period: '2012 Jan', user_0: 10687, user_1: 4460, user_2: 2028},
          {period: '2012 Apr', user_0: 8432, user_1: 5713, user_2: 1791}
        ],
        xkey: 'period',
        ykeys: ['user_0', 'user_1', 'user_2'],
        labels: ['Alic', 'Bob', 'Charles'],
        pointSize: 2,
        parseTime: false,
        hideHover: 'auto',
        resize: true,
        redraw: true
      });

      dashboard_time_chart_inbound_activities = Morris.Line({
        element: 'chart_line_inbound_activities',
        data: [
          {period: '2010 Jan', user_0: 2666, user_1: null, user_2: 2647},
          {period: '2010 Apr', user_0: 2778, user_1: 2294, user_2: 2441},
          {period: '2010 Jul', user_0: 4912, user_1: 1969, user_2: 2501},
          {period: '2010 Sep', user_0: 3767, user_1: 3597, user_2: 5689},
          {period: '2011 Jan', user_0: 6810, user_1: 1914, user_2: 2293},
          {period: '2011 Apr', user_0: 5670, user_1: 4293, user_2: 1881},
          {period: '2011 Jul', user_0: 4820, user_1: 3795, user_2: 1588},
          {period: '2011 Sep', user_0: 15073, user_1: 5967, user_2: 5175},
          {period: '2012 Jan', user_0: 10687, user_1: 4460, user_2: 2028},
          {period: '2012 Apr', user_0: 8432, user_1: 5713, user_2: 1791}
        ],
        xkey: 'period',
        ykeys: ['user_0', 'user_1', 'user_2'],
        labels: ['Alic', 'Bob', 'Charles'],
        pointSize: 2,
        parseTime: false,
        hideHover: 'auto',
        resize: true,
        redraw: true
      });

    });
  }
}

/**
 * request and update date-time-range selector
 */
function initDateTimeRange() {

  var ui_id = '#date_range_slider';

  if (ui_id) {


    $.get('search/dates').then(function (response) {
      console.log( 'initDateTimeRange()' );

      //validate service-response
      response = validateDateRangeResponse( response );

      var doc_dates = response.doc_dates;
      var start_datetime = doc_dates[0].datetime;
      var start_date_array = start_datetime.split('T')[0].split('-');
      var start_date = new Date(parseInt(start_date_array[0]), parseInt(start_date_array[1])-1, parseInt(start_date_array[2]));

      var end_datetime = doc_dates[doc_dates.length-1].datetime;
      var end_date_array = end_datetime.split('T')[0].split('-');
      var end_date = new Date(parseInt(end_date_array[0]), parseInt(end_date_array[1])-1, parseInt(end_date_array[2]));

      console.log( '\tstart_date : ' + start_datetime + ' end_date : ' + end_datetime );

      var default_interval_months = 3;
      var default_start_year = end_date.getFullYear();
      var default_start_month = end_date.getMonth() - default_interval_months;
      if (default_start_month <= 0) {
        default_start_month = default_start_month + 12;
        default_start_year = default_start_year - 1;
      }
      var default_start_day = end_date.getDate();
      if (default_start_day > 28) {
        default_start_day = 28;
      }

      var default_start_date = new Date(default_start_year, default_start_month, default_start_day);



      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
      //var months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

      $(ui_id).dateRangeSlider({
        bounds: {min: start_date, max: end_date},
        defaultValues: {min: default_start_date, max: end_date},
        scales: [{
          first: function(value){ return value; },
          end: function(value) {return value; },
          next: function(value){
            var next = new Date(value);
            return new Date(next.setMonth(value.getMonth() + 3));
          },
          label: function(value){
            return months[value.getMonth()] + ', ' + value.getFullYear();
          }
        }]
      });

      date_range.setDateMinText(default_start_date.toISOString().substring(0, 10));
      date_range.setDateMaxText(end_date.toISOString().substring(0, 10));

    });

  }
}

/**
 * draw Morris Donut charts
 */
function drawDashboardCharts() {

  initDateTimeRange();

  drawChartEntity(10);
  drawChartTopic(10);
  drawChartDomain(10);
  draw_chart_account_activities(5);

}

//
//  Dynamically load Morris Charts plugin
//  homepage: http://www.oesmith.co.uk/morris.js/ v0.4.3 License - MIT
//  require Raphael http://raphael.js
//
function LoadMorrisScripts(callback){
    function LoadMorrisScript(){
        if(!$.fn.Morris){
            $.getScript('plugins/morris/morris.min.js', callback);
        }
        else {
            if (callback && typeof(callback) === "function") {
                callback();
            }
        }
    }
    if (!$.fn.raphael){
        $.getScript('plugins/raphael/raphael-min.js', LoadMorrisScript);
    }
    else {
        LoadMorrisScript();
    }
}