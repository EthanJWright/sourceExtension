function getCurrentPage(){
  var url = window.location.toString();
  url = url.split('/');
  var current_page;
  url.forEach(function(element){
    if(element.indexOf(".com") !== -1){
      current_page = element;
    }
  });

  current_page = current_page.replace(".com", "");
  return current_page;
}

function getBody(html){
//  html = html.replace(/([\s\S]*?)<head [\s\S]*?<\/head>/g, '$1');
  /* Remove elements in footer */
  html = html.replace(/([\s\S]*?)<footer [\s\S]*?<\/footer>/g, '$1');
    /* Remove List Elements, often unrelated links*/
  html = html.replace(/([\s\S]*?)<li class[\s\S]*?<\/li>/g, '$1');
  return html;
}

function extractHREF(html){
    var patt = /<a href="(.*?)"/g;
    var match = html.match(patt);
    var hrefs = '';
    var href_array = [];
    match.forEach(function(element){
      var in_quotes = element.match(/"((?:\\.|[^"\\])*)"/);
//      var in_quotes = element;
      if(in_quotes[0].length > 3){
        if(in_quotes[0].indexOf("https") !== -1 || in_quotes[0].indexOf("www") !== -1 ){
          href_array.push(in_quotes[0]);
          hrefs +=  in_quotes[0] + '\n';
        }
      }
    })
    return href_array;
}

function cleanList(href, remove){
  var approved = [];
  for(var i = 0; i < href.length; i++){
    var blacklisted = false;
    for(var j = 0; j < remove.length; j++){
      if(href[i].indexOf(remove[j]) !== -1){
        blacklisted = true;
      }
    }
    if(!blacklisted){
      approved.push(href[i]);
    }
  }
  return approved;
}

function DOMtoString(document_root) {
    var html = '',
    attr = '',
    node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
            break;
        case Node.CDATA_SECTION_NODE:
            html += '<![CDATA[' + node.nodeValue + ']]>';
            break;
        case Node.COMMENT_NODE:
            html += '<!--' + node.nodeValue + '-->';
            break;
        case Node.DOCUMENT_TYPE_NODE:
            // (X)HTML documents are identified by public identifiers
            html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
            break;
        }
        node = node.nextSibling;
    }
    html = getBody(html);
    var page = getCurrentPage();
    var href = extractHREF(html);
    var remove = ["zergnet", "facebook", "instagram", "youtube", "google", "trulia", "addtoany","about/privacy-policy", "user/profile", "adobe", "wallpaper.com"];
    href = cleanList(href, remove);
    if(href.length < 1){
      return "No Relevant Sources Found";
    }
    var external_sources = [];
    var internal_sources = [];
    href.forEach(function(link){
      if(link.indexOf(page) === -1){
        external_sources.push(link);
      }else{
        internal_sources.push(link);
      }
    });

    var return_string = 'External Sources(' + external_sources.length + '):\n \n';
    external_sources.forEach(function(element){
      element = element.replace("\"", "");
      element = element.replace("\"", "");
      return_string += element + "\n";
    });

    return_string += "\n \n Internal Sources (" + internal_sources.length + "): \n \n";
    internal_sources.forEach(function(element){
      element = element.replace("\"", "");
      element = element.replace("\"", "");
      return_string += element + "\n";
    });

    return "View Page Sources: \n" + return_string + "\n\n";
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});
