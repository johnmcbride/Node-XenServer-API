//for more xen server API specific information check out 
//https://docs.citrix.com/content/dam/docs/en-us/xenserver/current-release/downloads/xenserver-management-api-guide.pdf

//used for connecting to the xenserver rpc api
var xmlrpc = require('xmlrpc-lite')
//helps with parsing xml into json
var fastXmlParse = require('fast-xml-parser')
//library to help doing xpath queries on the xml returned from the RPC calls
var xpath = require('xpath')
//library to help parse the XML in a xmldocument
var xdom = require('xmldom').DOMParser

//grab the username and password from the package.json
var username = require('./package.json').creds.user;
var password = require('./package.json').creds.pass;
var serveraddress = require('./package.json').xenserveraddress

//variable to hold the login session returned from the xenserver
var xenSession = null;

//initiate a new XMLRPC client. URL should the ip address of the xen server
var xen = new xmlrpc(serveraddress)

//call the login_with_password method over the RPC client.
// param 1 = function (method) to call
// param 2 = creditials (uname, password)
// param 3 = callback method that will generally return a XML document
xen.call('session.login_with_password',[username,password],function (err,xml) {
    //parse the xml doc
    var sessionDoc = new xdom().parseFromString(xml)
    //select on the member element where the text is Status
    var memberNode = xpath.select('//member[name[text()="Status"]]',sessionDoc)
    // conver the xml node into json
    var successMember = fastXmlParse.parse(memberNode[0].toString())

    //check to see if the value is sucess, which mean a good auth.
    if ( successMember.member.value === "Success")
    {
        //auth from successful so now we need to get the login session information and
        //store it in a var for addition use. The format will be like this 
        //OpaqueRef:b667fbb4-2fb3-4e30-9f1e-eca02deb4ac9

        //get and store the session info (OpaqueRef:b667fbb4-2fb3-4e30-9f1e-eca02deb4ac9)
        var sessionNode = xpath.select('//member[name[text()="Value"]]',sessionDoc)
        var sessionMember = fastXmlParse.parse(sessionNode[0].toString())
        xenSession = sessionMember.member.value;

        //now that we have the session store, let's make another call to get a list of all
        //the VMs listed on the xenserver
        //param 1 = the method to call over RPC
        //param2 = the login session we received above
        //param3 = function callback when the method completes. err and XML will
        //be returned. This will return only refs for each VM
        xen.call('VM.get_all',[xenSession], function (err,vmxml){
            //parse the xml returned into a xml document
            var VirtualMachinesXmlDoc = new xdom().parseFromString(vmxml)
            //xpath query to get all the values returned.
            var valueNodes = xpath.select('//data/value',VirtualMachinesXmlDoc)
            //conver the xml into json to parse a little easier            
            var vmRefs = fastXmlParse.parse(valueNodes.toString())
            //loop through each element returned
            vmRefs.value.forEach(element => {
                //call the get_record method to get detailed information for each element
                //param 1 = the method to call over RPC
                //param2 = the login session we received above
                //param3 = function callback when the method completes. err and XML will
                //be returned. This will return vm information
                xen.call('VM.get_record',[xenSession,element],function (err, recordxml) {
                    //parse the record xml into a XML Document
                    var VirtualMachineXmlDoc = new xdom().parseFromString(recordxml)
                    //select the member element based on the naming being
                    // "name_label"
                    var nameNode = xpath.select('//member[name[text()="name_label"]]',VirtualMachineXmlDoc)
                    //parse the xml node into a JSON object to make it easier
                    //to get the values
                    var nameMember = fastXmlParse.parse(nameNode.toString())
                    //print out the name
                    console.log(nameMember.member.value)
                })
            });
            //console.log(vmRefs)
        })

        
    }
})

console.log('end of calls')


