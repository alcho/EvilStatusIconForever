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

// The following list will control which bulit-in status
// icon show be hidden.

var removeStatusIcon = [
    'a11y',         // Accessibility
    // 'volume',
    // 'battery',
    // 'keyboard',
    // 'bluetooth',
    // 'network'
]


/******************************************************
 * Don't touch anything below!
 *****************************************************/

const StatusIconDispatcher = imports.ui.statusIconDispatcher;
const Panel = imports.ui.panel;
const Main = imports.ui.main;


function hideStatusIcon(name)
{
    for (var i = 0; i < Main.panel._rightBox.get_children().length; i++) {
        if (Main.panel._statusArea[name] == 
            Main.panel._rightBox.get_children()[i]._delegate) {
            Main.panel._rightBox.get_children()[i].destroy();
            break;
        }
    }

    Main.panel._statusArea[name] = null;
}

function restoreStatusIcon(name)
{
    let indicator = new Panel.STANDARD_STATUS_AREA_SHELL_IMPLEMENTATION[name];
    Main.panel.addToStatusArea(
        name, indicator, Panel.STANDARD_STATUS_AREA_ORDER.indexOf(name)
    );
}

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

    for (var i = 0; i < removeStatusIcon.length; i++) {
        global.log('Remove ' + removeStatusIcon[i] + " from top bar");
        hideStatusIcon(removeStatusIcon[i]);
    }

}

function disable() {

    for (var i = 0; i < notification.length; i++) {
        global.log('Remove ' + notification[i] + " from top bar");
        removeFromTopBar(notification[i]);
    }

    for (var i = 0; i < removeStatusIcon.length; i++) {
        global.log('Restore ' + removeStatusIcon[i] + " to top bar");
        restoreStatusIcon(removeStatusIcon[i]);
    }

}

