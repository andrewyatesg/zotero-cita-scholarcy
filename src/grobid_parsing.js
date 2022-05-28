let parser = new DOMParser();
let xml = parser.parseFromString(text, "text/xml");

citations = xml.getElementsByTagName("biblStruct");

addLinksToCitations();

async function addLinksToCitations() {
    for (citation of citations) {
        citationIDs = childrenWithTag(citation, "idno");
    
        DOIs = citationIDs.filter(id => id.getAttribute("type") == "DOI");
        arxivIDs = citationIDs.filter(id => id.getAttribute("type") == "arXiv");
    
        if (DOIs.length > 0) {
            let url = await getURLfromDOI(DOIs[0].textContent);
            console.log(url);
        } else if (arxivIDs.length > 0) {
            let url = await getURLfromArxiv(arxivIDs[0].textContent.substring(6));
            console.log(url);
        } else {
            console.log("No ID found");
        }
    }
}

// parent is an HTMLCollection; tag is a string
function childrenWithTag(parent, tag) {
    let withTag = [];
    for (child of parent.children) {
        if (child.tagName == tag) withTag.push(child);
        withTag = withTag.concat(childrenWithTag(child, tag))
    }
    return withTag;
}

// doi is a string
async function getURLfromDOI(doi) {
    let url = new URL("https://api.crossref.org/works/" + doi);
    let response = await fetch(url);
    let data = await response.json();
    return data.message.URL;
}

// arxivID is a string
async function getURLfromArxiv(arxivID) {
    let url = new URL("http://export.arxiv.org/api/query?id_list=" + arxivID);
    let response = await fetch(url);
    let data = await response.text();
    let xml = parser.parseFromString(data, "text/xml");
    return xml.getElementsByTagName("id")[0].textContent;
}
