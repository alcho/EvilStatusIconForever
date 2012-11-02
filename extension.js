/*****************************************************
 * Status Icon Settings
 ****************************************************/

//
// Add application you want it shows thier notification status
// icon on top bar to the following list.
//
// You may use top/htop to find out the name of application.
//

var notification = [
    'deadbeef',     // Deadbeef Music Player
    'pidgin',       // Pidgin IM Client
    'gcin',         // GCIN Chinese Input Method
    'hime',         // HIME Imput Method Editor
    'dropbox',      // Drop Box
    'thunderbird-bin',  // Thunderbird-bin (Gentoo binary package)
    'thunderbird',      // Thunderbird
    'transmission',   //Transmission
    'firefox',          // Firefox with FireTray
    'firefox-bin',      // Firefox-bin (Gentoo binary package)
    'workrave',         // Workrave
    'gajim',            // Gajim
    'wicd-client.py',   // Wicd-gtk
    'skype'             // Skype
]


// Add which built-in status icon you want to remove in the
// following list.
//

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

const Shell = imports.gi.Shell;

const PanelMenu = imports.ui.panelMenu;
const Panel = imports.ui.panel;
const Main = imports.ui.main;
const STANDARD_TRAY_ICON_IMPLEMENTATIONS = imports.ui.notificationDaemon.STANDARD_TRAY_ICON_IMPLEMENTATIONS;
let trayManager, addedID;
let statusArea;

function LOG(message) {
    //log(message);
}

/**
 *  Hide built-in status icon.
 *
 *  Note: in 3.6 the top-level actor for a status button in
 *  _rightBox.get_children() doesn't have a ._delegate; its first child does.
 *  So instead we just remove from the status area directly.
 */
function hideStatusIcon(name)
{
    if (statusArea[name]) {
        statusArea[name].actor.hide();
    }
}

/**
 *  Show built-in status icon again.
 */
function showStatusIcon(name)
{
    if (statusArea[name]) {
        statusArea[name].actor.show();
    }
}

/** Callback when a tray icon is added to the tray manager.
 * We make a panel button for the top panel for it. */
function _onTrayIconAdded(o, icon) {
    let wmClass = icon.wm_class ? icon.wm_class.toLowerCase() : '';
    if (notification.indexOf(wmClass) === -1) {
        // skip it
        return;
    }

    icon.height = Panel.PANEL_ICON_SIZE;
    let buttonBox = new PanelMenu.Button();
    let box = buttonBox.actor;
    box.add_actor(icon);

    Main.panel._addToPanelBox(wmClass, buttonBox, 0, Main.panel._rightBox);
}

// STANDARD_TRAY_ICON_IMPLEMENTATIONS is necessary for 3.6
// to stop the message tray also making an icon for it.
function removeFromTopBar(wmClass)
{
    delete STANDARD_TRAY_ICON_IMPLEMENTATIONS[wmClass];
    if (statusArea[wmClass]) {
        statusArea[wmClass].destroy();
    }
}

function addToTopBar(wmClass)
{
    STANDARD_TRAY_ICON_IMPLEMENTATIONS[wmClass] = wmClass;
}

function init() {
}

function enable() {
    statusArea = Main.panel.statusArea;
    trayManager = Main.notificationDaemon._trayManager;
    addedID = trayManager.connect('tray-icon-added', _onTrayIconAdded);

    for (var i = 0; i < notification.length; i++) {
        LOG('Add ' + notification[i] + " to top bar");
        addToTopBar(notification[i]);
    }

    for (var i = 0; i < removeStatusIcon.length; i++) {
        LOG('Remove ' + removeStatusIcon[i] + " from top bar");
        hideStatusIcon(removeStatusIcon[i]);
    }

}

function disable() {
    trayManager.disconnect(addedID);
    addedID = 0;

    for (var i = 0; i < notification.length; i++) {
        LOG('Remove ' + notification[i] + " from top bar");
        removeFromTopBar(notification[i]);
    }

    for (var i = 0; i < removeStatusIcon.length; i++) {
        LOG('Restore ' + removeStatusIcon[i] + " to top bar");
        showStatusIcon(removeStatusIcon[i]);
    }

}
