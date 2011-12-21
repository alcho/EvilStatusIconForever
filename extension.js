/*****************************************************
 * Statuc Icon Settings
 ****************************************************/

//
// Add application you want it shows thier notification status
// icon on top bar to the following list.
//
// You may use top/htop to find out the name of application.
//

var notification = [
    'deadbeef',
    'pidgin',
    'gcin',
    'hime'
]


/******************************************************
 * Don't touch anything below!
 *****************************************************/

const StatusIconDispatcher = imports.ui.statusIconDispatcher;
const Panel = imports.ui.panel;
const Main = imports.ui.main;



function removeFromTopBar(wmClass)
{
    delete StatusIconDispatcher.STANDARD_TRAY_ICON_IMPLEMENTATIONS[wmClass];
}

function addToTopBar(wmClass)
{
    StatusIconDispatcher.STANDARD_TRAY_ICON_IMPLEMENTATIONS[wmClass] = wmClass;
}

function init() {
}

function enable() {

    for (var i = 0; i < notification.length; i++) {
        global.log('Add ' + notification[i] + " to top bar");
        addToTopBar(notification[i]);
    }

}

function disable() {

    for (var i = 0; i < notification.length; i++) {
        global.log('Remove ' + notification[i] + " from top bar");
        removeFromTopBar(notification[i]);
    }

}

