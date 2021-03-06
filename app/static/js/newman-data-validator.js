/**
 * Created by jlee on 10/07/15.
 */

/**
 * validate search-service email-document response
 * @param response data received from service
 * @returns filtered response
 */
function validateResponseEmailDocs(response) {
  if (response) {
    console.log( 'validateResponseEmailDocs(...)' );

    // validate email_docs
    if (response.email_docs) {
      console.log( '\temail_docs[' + response.email_docs.length + ']' );

      var new_email_docs = [];
      var invalid_doc_count = 0;
      _.each(response.email_docs, function (item) {

        if (validateDateTime(item.datetime)) {

          if (item.from) {
            var address = decodeURIComponent( item.from );

            // check for email address
            if (validateEmailAddress( address )) {
              item.from = address;
              //console.log('\tfrom \'' + address + '\'');

              new_email_docs.push(item);
            }
            else {
              console.log('\tinvalid email : ' + item.from);
              invalid_doc_count++;
            }
          }
          else {
            console.log('\tundefined email : ' + item.from);
            invalid_doc_count++;
          }
        }
        else {
          console.log('\tinvalid datetime : ' + item.datetime);
          invalid_doc_count++;
        }

      });

      response.email_docs = new_email_docs;
      console.log( '\tnew email_docs[' + response.email_docs.length + '], invalid row ' + invalid_doc_count );
    }

    return response;
  }

  console.log( 'response undefined' );
  return response;
}

/**
 * validate search-service response
 * @param response data received from service
 * @returns filtered response
 */
function validateEmailSearchResponse( response ) {
  var debug_enabled = false;
  if (response) {

    // validate graph nodes and links
    if (response.graph) {
      if (debug_enabled) {
        console.log('validateEmailSearchResponse(response.graph)');
        console.log('\tnodes[' + response.graph.nodes.length + '] links[' + response.graph.links.length + ']');
      }

      var new_nodes = [];
      var new_links = [];
      var invalid_node_count = 0;
      var invalid_link_count = 0;

      var clone_nodes = clone(response.graph.nodes);
      var clone_links = clone(response.graph.links);

      // validate graph-nodes
      _.each(response.graph.nodes, function (item, index) {

        if (validateEmailAddress( item.name )) {

          new_nodes.push( item );
        }
        else {
          if (debug_enabled) {
            console.log('\tinvalid node(email) { name: ' + item.name + ', community: ' + item.community + ' index: ' + index + ' }');
          }

          invalid_node_count++;

          _.each(response.graph.links, function (item) {

            if (item.source == index || item.target == index) {

              clone_links.splice(index, 1);

              if (debug_enabled) {
                console.log('\t\tinvalidated link { source: ' + item.source + ', target: ' + item.target + ", value: " + item.value + ' }');
              }

              invalid_link_count++;
            }

          });

        }
      });

      // validate graph-links
      _.each(clone_links, function (item) {

        if (new_nodes[item.source] && new_nodes[item.target]) {

          new_links.push( item );
        }
        else {
          if (debug_enabled) {
            console.log('\tundefined link { source: ' + item.source + ', target: ' + item.target + ", value: " + item.value + ' }');
          }

          invalid_link_count++;
        }
      });

      response.graph.nodes = new_nodes;
      response.graph.links = new_links;

      if (debug_enabled) {
        console.log('\tnew nodes[' + response.graph.nodes.length + '], invalid nodes ' + invalid_node_count +
                    ', new links[' + response.graph.links.length + '], invalid links ' + invalid_link_count);
      }

    }

    // validate rows
    if (response.rows) {
      if (debug_enabled) {
        console.log('\trows[' + response.rows.length + ']');
      }

      var new_rows = [];
      var invalid_row_count = 0;
      _.each(response.rows, function (item) {

        if (validateDateTime(item.datetime)) {

          if (item.from) {
            var address = decodeURIComponent( item.from );

            // check for email address
            if (validateEmailAddress( address )) {
              item.from = address;
              //console.log('\tfrom \'' + address + '\'');

              new_rows.push(item);
            }
            else {
              if (debug_enabled) {
                console.log('\tinvalid email : ' + item.from);
              }
              invalid_row_count++;
            }
          }
          else {
            if (debug_enabled) {
              console.log('\tundefined email : ' + item.from);
            }
            invalid_row_count++;
          }
        }
        else {
          if (debug_enabled) {
            console.log('\tinvalid datetime : ' + item.datetime);
          }
          invalid_row_count++;
        }

      });

      response.rows = new_rows;
      if (debug_enabled) {
        console.log('\tnew rows[' + response.rows.length + '], invalid row ' + invalid_row_count);
      }
    }

    return response;
  }

  if (debug_enabled) {
    console.log('response undefined');
  }
  return response;
}

/**
 * validate email-rank response
 * @param response data received from service
 * @returns filtered response
 */
function validateResponseTopEmailAccount(response) {


  if (response) {
    console.log('validateResponseTopEmailAccount(...)');
    //console.log( '\tresponse\n' + JSON.stringify(response, null, 2) );

    if (response.emails) {
      //console.log( '\temails[' + response.emails.length + ']' );

      var new_emails = [];
      var invalid_item_count = 0;
      _.each(response.emails, function (email) {

        var new_email = [
          email[0],
          email[1],
          parseInt(email[2]),
          parseInt(email[3]),
          parseFloat(email[4]).toFixed(3),
          parseInt(email[5]),
          parseInt(email[6]),
          parseInt(email[7])
        ];

        if (new_email) {
          new_emails.push(new_email);
        }
        else {
          //console.log('\tinvalid score : ' + score);
          invalid_item_count++;
        }
      });

      response.emails = new_emails;
      //console.log( 'validated-response:\n' + JSON.stringify(response, null, 2) );

      console.log( '\tnew emails[' + response.emails.length + ']' );
      return response;
    }
    else {
      console.log('response.emails undefined');
    }
  }
  else {
    console.log('response undefined');
  }

  return response;
}


/**
 * validate email-exportable response
 * @param response data received from service
 * @returns filtered response
 */
function validateResponseEmailExportable(response) {


  if (response) {
    console.log('validateResponseEmailExportable(...)');
    //console.log( '\tresponse\n' + JSON.stringify(response, null, 2) );

    if (response.emails) {
      //console.log( '\temails[' + response.emails.length + ']' );

      var new_emails = [];
      var invalid_item_count = 0;
      _.each(response.emails, function (email) {

        var new_email = [ email[0], email[1] ];

        if (new_email) {
          new_emails.push(new_email);
        }
        else {
          //console.log('\tinvalid score : ' + score);
          invalid_item_count++;
        }
      });

      response.emails = new_emails;
      //console.log( 'validated-response:\n' + JSON.stringify(response, null, 2) );

      console.log( '\tnew emails[' + response.emails.length + ']' );
      return response;
    }
    else {
      console.log('response.emails undefined');
    }
  }
  else {
    console.log('response undefined');
  }

  return response;
}


/**
 * validate date-range-service response
 * @param response data received from service
 * @returns filtered response
 */
function validateResponseDateRange(response) {
  if (response) {
    console.log('validateResponseDateRange(...)');

    if (response.doc_dates) {
      console.log( '\tdomains[' + response.doc_dates.length + ']' );

      var new_doc_dates = [];
      var invalid_item_count = 0;
      _.each(response.doc_dates, function (item) {

        if (validateDateTime( item.datetime )) {
          if (validateEmailAddress(item.from)) {

            new_doc_dates.push(item);
          }
          else {
            console.log('\tinvalid email-address { from: ' + item.from + ', date: ' + item.datetime + ' }');
            invalid_item_count++;
          }
        }
        else {
          console.log('\tinvalid datetime { from: ' + item.from + ', date: ' + item.datetime + ' }');
          invalid_item_count++;
        }

      });

      response.doc_dates = new_doc_dates;
      console.log( '\tnew domains[' + response.doc_dates.length + '], invalid domains ' + invalid_item_count );
    }

    return response;
  }

  console.log( 'response undefined' );
  return response;
}

/**
 * validate datetime as text
 * @param datetime_text typically in the format of yyyy-MM-ddThh:mm:ss
 * @returns true if the text is valid datetime representation, false otherwise
 */
function validateDateTime(datetime_text) {
  if (datetime_text) {
    if (isNaN(Date.parse(datetime_text))) {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * validate email address
 * @param email_address
 * @returns true if the argument is valid, false otherwise
 */
function validateEmailAddress(email_address) {
  var debug_enabled = false;
  if(email_address) {
    /*
     var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
     return regex.test(email_address);
     */
    var name = email_address.split('@')[0];
    if(validateEmailUser(name)) {
      var domain = email_address.split('@')[1];
      if(validateEmailDomain(domain)) {
        return true;
      }
      if(debug_enabled) {
        console.log('\tinvalid email-domain: ' + name);
      }
      return false;
    }
    if(debug_enabled) {
      console.log('\tinvalid email-user: ' + name);
    }
    return false;
  }
  return false;
}

/**
 * validate email user
 * @param email_user
 * @returns true if the argument is valid, false otherwise
 */
function validateEmailUser(email_user) {
  if(email_user) {
    if(!containsWhitespace(email_user)) {
      var regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*/i;
      return regex.test(email_user);
    }
    return false;
  }
  return false;
}

/**
 * validate email main
 * @param email_domain
 * @returns true if the argument is valid, false otherwise
 */
function validateEmailDomain(email_domain) {
  if(email_domain) {
    if(!containsWhitespace(email_domain)) {
      var regex = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
      return regex.test(email_domain);
    }
    return false;
  }
  return false;
}

/**
 * validate email-topic-score response
 * @param response data received from service
 * @returns filtered response
 */
function validateResponseEmailTopicScore(response) {


  if (response) {
    console.log('validateResponseEmailTopicScore(...)');
    //console.log( '\tresponse\n' + JSON.stringify(response, null, 2) );

    if (response[0].scores) {
      //console.log( '\tscores[' + response[0].scores.length + ']' );

      var new_scores = [];
      var invalid_item_count = 0;
      _.each(response[0].scores, function (score) {

        var score_value = parseFloat(score);

        if (score_value) {
          new_scores.push(score_value);
        }
        else {
          //console.log('\tinvalid score : ' + score);
          invalid_item_count++;
        }
      });

      response[0].scores = new_scores;
      //console.log( 'validated-response:\n' + JSON.stringify(new_response, null, 2) );

      console.log( '\tnew scores[' + response[0].scores.length + ']' );
      return response;
    }
    else {
      console.log('response[0].scores undefined');
    }
  }
  else {
    console.log('response undefined');
  }

  return response;
}