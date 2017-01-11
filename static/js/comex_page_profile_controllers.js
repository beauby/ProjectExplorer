/**
 * @fileoverview
 * Profile 1/overview and 2/completing
 * @todo
 *    - package.json
 *
 * @version 1
 * @copyright ISCPIF-CNRS 2016
 * @author romain.loth@iscpif.fr
 *
 * @requires comex_user_shared
 *
 * NB The uinfo variable should be set to template's user.json_info value.
 */

// first menu setup from DB values
function selectSavedMenus(uinfo) {
    for (var i in cmxClt.COLS) {
        var colType = cmxClt.COLS[i][3]
        // m <=> menu
        if (colType == 'm') {
            var colName = cmxClt.COLS[i][0]
            var chosenV = uinfo[colName]
            var selectElt = document.getElementById(colName)
            selectElt.selectedIndex = selectElt.querySelector(`option[value="${chosenV}"]`).index
        }
    }
}

selectSavedMenus(uinfo)

// initialize form controllers
cmxClt.uform.initialize("comex_profile_form", completionAsYouGo)

// main validation function
// ------------------------
function completionAsYouGo() {
    cmxClt.uform.mainMessage.style.display = 'block'
    cmxClt.uform.mainMessage.innerHTML = "Checking the answers..."

    var diagnostic = cmxClt.uform.testFillField(cmxClt.uform.theForm,
                                                {'fixResidue': true})

    var valid = diagnostic[0]
    var mandatoryMissingFields = diagnostic[1]
    var optionalMissingFields = diagnostic[2]

    if (valid) {
        cmxClt.uform.mainMessage.innerHTML = "<span class='green glyphicon glyphicon-check' style='float:left;'></span>&nbsp;&nbsp;OK we have all the important fields!<br/>"
    }
    else {
        cmxClt.uform.mainMessage.innerHTML = "<span class='red glyphicon glyphicon-warning-sign'></span>&nbsp;&nbsp;Sorry, there are some important missing fields<br/>"
    }

    // list of missing fields
    cmxClt.uform.mainMessage.innerHTML += cmxClt.ulListFromLabelsArray(mandatoryMissingFields, ['red'])

    if (optionalMissingFields.length) {
        cmxClt.uform.mainMessage.innerHTML += cmxClt.ulListFromLabelsArray(
                optionalMissingFields,
                ['white'],
                "You may also want to fill:"
            )
    }

    // stamp => #last_modified_date
    cmxClt.uform.stampTime()

    // debug
    // console.log("timestamp:", cmxClt.uform.timestamp.value)
}

// run first check on existing profile data pre-filled by the template
completionAsYouGo()

// 2 exposed vars for inline js controls
var teamCityDivStyle = document.getElementById('team_city_div').style
var otherInstDivStyle = document.getElementById('other_org_div').style

console.log("profile controllers load OK")