

/**
 * tree SVG container
 */
var app_tree_ui = (function () {
  var debug_enabled = false;

  var is_graph_node_label_on = false;

  var tree_ui_id = 'tree_email';
  var tree_ui_jquery_id = '#' + tree_ui_id;
  var tree_ui_jquery = $(tree_ui_jquery_id);
  var ui_max_width = tree_ui_jquery.width();
  var ui_max_height = tree_ui_jquery.height();

  var baseSVG, svgGroup;

  var last_known_x, last_known_y;

  function getNodeIcon( node_element ) {
    if (node_element && node_element.is_selected === true) {
      return (FONT_AWESOME_ICON_UNICODE['flag']);
    }

    return (FONT_AWESOME_ICON_UNICODE['user']);
  }

  function toggleAllNodeLabel( label_on ) {
    if (baseSVG) {
      if (label_on === true) {

        baseSVG.selectAll( "text" )
          .attr("x", function(d) {
            return d.children || d._children ? -10 : 10;
          })
          .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
          })
          .text(function(d) {
            return d.name;
          });

      }
      else {

        baseSVG.selectAll( "text" )
          .attr("x", function(d) {
            return d.children || d._children ? -10 : 10;
          })
          .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
          })
          .text(function(d) {
            return d.name;
          })
          .style("opacity",function() {
            return 100;
          });

      }
    }
  }

  function initEvents() {

    $("#label_text_checkbox").change(function () {
      is_graph_node_label_on = $(this).prop("checked");

      console.log('toggleAllNodeLabel( ' + is_graph_node_label_on + ' )');
      toggleAllNodeLabel( is_graph_node_label_on );

    });

  }

  function initTree( tree_data ) {
    open();
    clearTree();
    initEvents();

    var original_tree;
    if (tree_data) {
      original_tree = clone(tree_data);
      if (debug_enabled) {
        console.log('tree:\n' + JSON.stringify(tree_data, null, 2));
      }
    }
    else {
      return;
    }

    // size of the diagram
    var width = ui_max_width;
    var height = ui_max_height;

    // calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    // variables for drag/drop
    var dragging = 0, dragX = 0, dragY = 0;
    var selectedNode = null;
    var draggingNode = null;
    // panning variables
    var panSpeed = 100;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    var panTimer = true;

    // Misc. variables
    var i = 0;
    //var duration = 750;
    var duration = 350;
    var root;

    var diameter = width;
    var center_x = (width / 2), center_y = (height / 2);
    var init_x = (width / 4), init_y = (height / 4);

    var tree = d3.layout.tree()
      .size([height, width]);

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
      .projection(function(d) {
        return [d.y, d.x];
      });

    // define the root
    root = tree_data;
    //root.x0 = center_x;
    //root.y0 = center_y;
    root.x0 = center_y;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    tree.nodes(root).forEach(function(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      }
      else {
        d.children = d._children;
        d._children = null;
      }

    });

    // Call visit function to establish maxLabelLength
    visit(tree_data, function(d) {
      totalNodes++;
      maxLabelLength = Math.max(d.name.length, maxLabelLength);
    }, function(d) {
      return d.children && d.children.length > 0 ? d.children : null;
    });

    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    var dragListener = d3.behavior.drag()
      .on("drag", function() {

        dragX = d3.event.dx;
        dragY = d3.event.dy;
      })
      .on("dragstart", function() {

        dragging = 1;
      })
      .on("dragend", function() {

        dragging = 0;
        dragX = 0;
        dragY = 0;
      });

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom()
      //.center([center_x, center_y])
      //.center([init_x, init_y])
      .scaleExtent([0.1, 10])
      .on("zoom", zoom);

    //zoomListener.translate([center_x, center_y]);
    zoomListener.translate([init_x, init_y]);

    // define the baseSvg, attaching a class for styling
    baseSVG = d3.select( tree_ui_jquery_id ).append("svg")
      .attr("width", width )
      .attr("height", height )
      //.call( zoomListener );
      .call( dragListener );

    zoomListener( baseSVG );

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    //svgGroup = baseSVG.append("g").attr("transform", "translate(" + center_x + "," + center_y + ")");
    svgGroup = baseSVG.append("g").attr("transform", "translate(" + init_x + "," + init_y + ")");

    // Collapse all children of root's children before rendering.
    /*
    if (root.children) {
      root.children.forEach(function (child) {
        collapse(child);
      });
    }
    */
    //root.children.forEach(collapse); // start with all children collapsed

    expandAll(); // start with all children expanded
    // layout the tree initially and center on the root node
    d3.select(self.frameElement).style("height", width + 'px');

    function update(source) {
      // Compute the new height, function counts total children of root node and sets tree height accordingly.
      // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
      // This makes the layout more consistent.
      var levelWidth = [1];

      var childCount = function(level, n) {

        if (n.children && n.children.length > 0) {
          if (levelWidth.length <= level + 1) levelWidth.push(0);

          levelWidth[level + 1] += n.children.length;
          n.children.forEach(function(d) {
            childCount(level + 1, d);
          });
        }
      };
      childCount(0, root);

      var newHeight = d3.max(levelWidth) * 30; // 30 pixels per line
      tree = tree.size([newHeight, width]);

      console.log('tree.size( [height : ' + newHeight + ', width : ' + width + '])');

      // Compute the new tree layout.
      var nodes = tree.nodes(root);
      var links = tree.links(nodes);

      var link_width_base = 60, link_width_child_node = 20;

      var toggled = false;

      // set variable widths between levels based on range_factor.
      nodes.forEach(function(d) {

        var tree_level = d.depth;
        var depth_factor = d.datetime_range_factor, sibling_count = d.node_sibling_count;
        var depth_base = tree_level * link_width_base;

        var node_depth = depth_base + link_width_child_node + link_width_base * depth_factor;

        if (sibling_count > 0 && tree_level > 0) {
          //console.log('node_sibling_count : ' + sibling_count);
          node_depth += (sibling_count * (tree_level * tree_level / 2));
        }

        d.y = node_depth;

        /*
        if (!toggled) {
          toggled = true;
          console.log('node :\n' + stringifyOnce(d, null, 2));
        }
        */
        console.log('nodes:forEach( depth_base : ' + depth_base + ' node_depth : ' + node_depth + ' depth_factor : ' + depth_factor + ' node_uid : ' + d.node_uid + ' )');

        //console.log('max_label_length : ' + maxLabelLength);
        //d.y = (d.depth * (maxLabelLength * 5)); //maxLabelLength * 5px
        // alternatively to keep a fixed scale one can set a fixed depth per level
        // Normalize for fixed-depth by commenting out below line
        // d.y = (d.depth * 500); //500px per level.
        //console.log('nodes:forEach\n' + stringifyOnce(d, null, 2));

      });

      // Update the nodes…
      var node = svgGroup.selectAll("g.tree-node")
        .data(nodes, function(d) {
          return d.id || (d.id = ++i);
        });

      // Update the text to reflect whether node has children or not.
      /*
      node.select('text')
        .attr("x", function(d) {
          //return d.children || d._children ? -10 : 10;
          return d.children || d._children ? -20 : 20;
        })
        .attr("text-anchor", function(d) {

          //return d.children || d._children ? "end" : "start";
          return d._children || d._children ? "end" : "start";

        })
        .text(function(d) {
          if (d.node_is_selected === true) {
            return d.name;
          }
          return '';
        });
      */

      // Change the circle fill depending on whether it has children and is collapsed
      node.select("circle.tree-node-circle")
        .attr("r", 4.5)
        .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#FFFFFF";
        });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("g")
        .attr("class", "tree-node")
     /*   .attr("transform", function(d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
        }) */
        .on("click", onClickNode)
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseOut);
        //.call(dragListener);

      nodeEnter.append("circle")
        .attr('class', 'tree-nodeCircle')
        //.attr("r", 1e-6)
        .attr("r", function(d) {
          if (d.node_is_selected === true) {
            return 7.5
          }
          return 5.5
        })
        .style("fill", function(d) {
          if (d.node_is_selected === true) {
            //return d._children ? "#FFEBAF" : "#FFFFFF";

            if (d.children) {
              return "#FFFFFF";
            }
            else if (d._children) {
              return "#FFEBAF";
            }
            else {
              return d.node_is_expandable ? "#E7E7E7" : "#FFFFFF";
            }
          }

          //return d._children ? "lightsteelblue" : "#FFFFFF";
          if (d.children) {
            return "#FFFFFF";
          }
          else if (d._children) {
            return "lightsteelblue";
          }
          else {
            return d.node_is_expandable ? "#E7E7E7" : "#FFFFFF";
          }
        })
        .style("stroke", function(d) {
          return toggleNodeHighLight(d, "stroke");
        })
        .style("stroke-width", function(d) {
          return toggleNodeHighLight(d, "stroke-width");
        })
        .style("stroke-opacity", function(d) {
          return toggleNodeHighLight(d, "stroke-opacity");
        })
        .on('mouseover', function(d) {
          d3.select(this)
            .style("stroke-width", "6.0px");
        })
        .on('mouseout', function(d) {
          d3.select(this)
            .style("stroke-width", toggleNodeHighLight(d, "stroke-width"))

        });

      nodeEnter.append("text")
        .attr("x", function(d) {
          //return d.children || d._children ? -10 : 10;

          if (d.ancestors) {
            return d.children || d._children ? 0 : 12;
          }
          else { // root node
            return -12 ;
          }
        })
        .attr("y", function(d) {

          if (d.ancestors) {
            return d.children || d._children ? -14 : 0;
          }
          else { // root node
            return 0 ;
          }
        })
        .attr("dy", ".35em")
        .attr('class', 'tree-nodeText')
        .attr("alignment-baseline", function(d) {
          return 'alphabetic';
        })
        .attr("text-anchor", function(d) {
          //return d.children || d._children ? "end" : "start";
          //console.log('node : ' + stringifyOnce(d, null, 2));

          if (d.ancestors) {
            return d.children || d._children ? "middle" : "start";
          }
          else { // root node
            return "end";
          }
        })
        .text(function(d) {
          //return d.name;

          if (d.node_is_selected === true) {
            return d.name;
          }
          return '';


        })
        //.style("font", "8px serif")
        //.style("opacity", 0.9)
        .style("fill-opacity", 0);
        //.style("fill-opacity", 1e-6);

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) {
          return "translate(" + d.y + "," + d.x + ")";
        });


      nodeUpdate.select("circle")
        .attr("r", function(d) {
          if (d.node_is_selected === true) {
            return 7.5
          }
          return 5.5
        })
        .style("fill", function(d) {
          if (d.node_is_selected === true) {
            //return d._children ? "#FFEBAF" : "#FFFFFF";

            if (d.children) {
              return "#FFFFFF";
            }
            else if (d._children) {
              return "#FFEBAF";
            }
            else {
              return d.node_is_expandable ? "#E7E7E7" : "#FFFFFF";
            }
          }

          //return d._children ? "lightsteelblue" : "#FFFFFF";
          if (d.children) {
            return "#FFFFFF";
          }
          else if (d._children) {
            return "lightsteelblue";
          }
          else {
            return d.node_is_expandable ? "#E7E7E7" : "#FFFFFF";
          }
        });

      // Fade the text in
      nodeUpdate.select("text")
        .style("fill-opacity", 1);


      // TODO: appropriate transform
      var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

      nodeExit.select("circle")
        //.attr("r", 1e-6);
        .attr("r", 0);

      nodeExit.select("text")
        //.style("fill-opacity", 1e-6);
        .style("fill-opacity", 0);

      // Update the links…
      var link = svgGroup.selectAll("path.tree-link")
        .data(links, function(d) {
          return d.target.id;
        });


      // Enter any new links at the parent's previous position.
      link.enter().insert("path", "g")
        .attr("class", "tree-link")
        .style("stroke", function(d) {
          return toggleLinkHighLight(d, "stroke");
        })
        .style("stroke-width", function(d) {
          return toggleLinkHighLight(d, "stroke-width");
        })
        .style("stroke-opacity", function(d) {
          return toggleLinkHighLight(d, "stroke-opacity");
        })
        .attr("d", function(d) {
          var o = {
            x: source.x0,
            y: source.y0
          };
          return diagonal({
            source: o,
            target: o
          });
        })
        .on('mouseover', function(d) {
          d3.select(this).style("stroke-width", "6.0px");

        })
        .on('mouseout', function(d) {
          d3.select(this).style("stroke-width", toggleLinkHighLight(d, "stroke-width"));
        })
        .on('click', onClickLink);

      // Transition links to their new position.
      link.transition()
        .duration(duration)
        .attr("d", diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {
            x: source.x,
            y: source.y
          };
          return diagonal({
            source: o,
            target: o
          });
        })
        .remove();

      // Stash the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Collapse nodes
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    function collapseAll(){
      root.children.forEach(collapse);
      collapse(root);
      update(root);
    }


    // Expand nodes
    function expand(d) {
      var children = (d.children)?d.children:d._children;

      if (d._children) {
        d.children = d._children;
        d._children = null;
      }

      if(children) {
        children.forEach(expand);
      }
    }

    function expandAll(){
      expand(root);
      update(root);
    }



    // Toggle children function
    function toggleChildren(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      }
      else if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      return d;
    }

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
    function centerNode(source) {

      var scale = zoomListener.scale();
      var x = -source.y0;
      var y = -source.x0;

      //console.log('centerNode(): x = ' + x + ' y = ' + y + ' scale = ' + scale);

      x = x * scale + init_x;
      y = y * scale + init_y;

      //console.log('centerNode(): x = ' + x + ' y = ' + y + ' scale = ' + scale);


      baseSVG.select('g').transition()
        .duration(duration)
        .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");

      zoomListener.scale(scale);
      zoomListener.translate([x, y]);
    }

    function leftAlignNode(source) {

      var scale = zoomListener.scale();
      var x = -source.y0;
      var y = -source.x0;

      //console.log('leftAlignNode(): x = ' + x + ' y = ' + y + ' scale = ' + scale);

      x = x * scale + init_x + 100;
      y = y * scale + init_y;

      //console.log('leftAlignNode(): x = ' + x + ' y = ' + y + ' scale = ' + scale);

      baseSVG.select('g').transition()
        .duration(duration)
        .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");

      zoomListener.scale(scale);
      zoomListener.translate([x, y]);
    }

    function onMouseOver(d) {
      d3.select(this)
        .append("text")
        .attr("class", "hover")
        .attr('transform', function(d) {
          return 'translate(5, -10)';
        })
        .text(d.name);

      console.log('node : ' + d.node_uid + ', x : ' + d.x + ', y : ' + d.y );
    }

    function onMouseOut(d) {
      d3.select(this)
        .select("text.hover").remove();
    }

    // handle event on click node
    function onClickNode(d) {
      d3.event.preventDefault();
      d3.event.stopImmediatePropagation();
      d3.event.stopPropagation();
      //if (d3.event.defaultPrevented) return; // click suppressed


      if (d.children || d._children) {
        // contains child element, expanded or collapsed

        var is_collapsed = false;
        if (d._children != null) {
          is_collapsed = true
        }
        //console.log('node ' + d.node_uid + ' : collapsed : ' + is_collapsed);


        d = toggleChildren(d);
        update(d);

      }
      else {

        var path;
        if (d.ancestors) {
          path = clone(d.ancestors);
        }
        else { // root
          path = [];
        }
        path.push(d.node_uid);

        app_tree_email.onAddSubTree(original_tree, path);
      }


    }

    // handle node highlight based on style property
    function toggleNodeHighLight(d, style_property) {

      if (style_property) {

        if (d.node_is_selected === true) {
          if (style_property == 'stroke') {
            //return "#FF0000";
            return "#FFB100";
          }

          if (style_property == 'stroke-width') {
            //return "1.0px";
            return "2.0px";
          }

          if (style_property == 'stroke-opacity') {
            return "1.0";
            //return "0.5";
          }

        }
        else {

          if (style_property == 'stroke') {
            return "#4682B4";
          }

          if (style_property == 'stroke-width') {
            return "1.0px";
          }

          if (style_property == 'stroke-opacity') {
            return "0.7";
            //return "1.0";
          }
        }

      }// end-of if (style_property)
    }

    // handle event on click link
    function onClickLink(d) {
      d3.event.preventDefault();
      d3.event.stopImmediatePropagation();
      d3.event.stopPropagation();
      //if (d3.event.defaultPrevented) return; // click suppressed

      d = d.target;
      if (d.link_artifact) { // leaf-node
        var email_id = d.link_artifact.email_id;
        console.log('link-clicked : ' + email_id);

        newman_email_doc_table.highlightDataTableRow(email_id);
      }
      else {
        console.log('link-clicked : ' + stringifyOnce(d, null, 2));
      }
      //console.log('link-clicked : ' + stringifyOnce(d, null, 2));

    }

    // handle link highlight based on style property
    function toggleLinkHighLight(d, style_property) {

      if (style_property) {

        if (d.target.node_is_selected === true) {
          if (style_property == 'stroke') {
            //return "#FF0000";
            return "#FFB100";
          }

          if (style_property == 'stroke-width') {
            return "1.5px";
          }

          if (style_property == 'stroke-opacity') {
            //return "0.5";
            return "1.0"
          }

        }
        else {

          if (style_property == 'stroke') {
            return "#4682B4";
          }

          if (style_property == 'stroke-width') {
            return "1.0px";
          }

          if (style_property == 'stroke-opacity') {
            return "0.7";
            //return "1.0";
          }
        }

      }// end-of if (style_property)
    }

    // sort the tree according to the node attributes
    function sortTree() {
      tree.sort(function(a, b) {
        var a_datetime = a.link_artifact_datetime, b_datetime = b.link_artifact_datetime;
        if (a_datetime >= 0 && b_datetime >= 0) {
          return b_datetime < a_datetime ? 1 : -1;
        }

        return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
      });
    }

    function pan(domNode, direction) {
      var speed = panSpeed, translateX, translateY;

      if (panTimer) {
        clearTimeout(panTimer);
        var translateCoords = d3.transform(svgGroup.attr("transform"));
        if (direction == 'left' || direction == 'right') {
          translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
          translateY = translateCoords.translate[1];
        }
        else if (direction == 'up' || direction == 'down') {
          translateX = translateCoords.translate[0];
          translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
        }
        var scaleX = translateCoords.scale[0];
        var scaleY = translateCoords.scale[1];
        var scale = zoomListener.scale();
        svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
        d3.select(domNode).select('g.tree-node').attr("transform", "translate(" + translateX + "," + translateY + ")");
        zoomListener.scale(zoomListener.scale());
        zoomListener.translate([translateX, translateY]);
        panTimer = setTimeout(function() {
          pan(domNode, speed, direction);
        }, 50);
      }
    }

    // Define the zoom function for the zoomable tree
    function zoom() {

      svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

    }



    // visit recursively all nodes and perform based on callback functions
    function visit(parent, visitFn, childrenFn) {
      if (!parent) return;

      visitFn(parent);

      var children = childrenFn(parent);
      if (children) {
        var count = children.length;
        for (var i = 0; i < count; i++) {
          visit(children[i], visitFn, childrenFn);
        }
      }
    }



  } // end-of function initTree()

  function clearTree() {
    if (baseSVG) {
      baseSVG.remove();
    }
  }

  function clearAll() {
    clearTree();

    if (tree_ui_jquery) {
      tree_ui_jquery.empty();
    }
  }


  function open() {
    if (isHidden()) {

      app_graph_ui.close();

      //tree_ui_jquery.fadeToggle('fast');
      tree_ui_jquery.show();
    }
  }

  function close() {
    if (isVisible()) {
      clearAll();

      //tree_ui_jquery.fadeToggle('fast');
      tree_ui_jquery.hide();
    }
  }

  function isVisible() {

    return (tree_ui_jquery && (tree_ui_jquery.is(':visible') || (tree_ui_jquery.css('display') != 'none')));
  }

  function isHidden() {

    return (tree_ui_jquery && ( tree_ui_jquery.is(':hidden') || (tree_ui_jquery.css('display') == 'none')));
  }


  return {
    'initTree' : initTree,
    'clearTree' : clearTree,
    'open' : open,
    'close' : close,
    'clearAll' : clearAll
  }

}());


