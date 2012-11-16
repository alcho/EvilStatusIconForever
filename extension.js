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
];


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
];

/******************************************************
 * Don't touch anything below!
 *****************************************************/

const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;

const PanelMenu = imports.ui.panelMenu;
const Panel = imports.ui.panel;
const Main = imports.ui.main;
const STANDARD_TRAY_ICON_IMPLEMENTATIONS = imports.ui.notificationDaemon.STANDARD_TRAY_ICON_IMPLEMENTATIONS;
let trayManager, addedID, fullScreenChangedId;
let statusArea;
let trayIcons = {};

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
    icon.width = Panel.PANEL_ICON_SIZE;
    let buttonBox = new PanelMenu.Button();
    let box = buttonBox.actor;
    box.add_actor(icon);

    Main.panel._addToPanelBox(wmClass, buttonBox, 0, Main.panel._rightBox);
    trayIcons[wmClass] = icon;
}

// STANDARD_TRAY_ICON_IMPLEMENTATIONS is necessary for 3.6
// to stop the message tray also making an icon for it.
function removeFromTopBar(wmClass)
{
    delete STANDARD_TRAY_ICON_IMPLEMENTATIONS[wmClass];
    if (trayIcons[wmClass]) {
        trayIcons[wmClass].unparent();
    }
    if (statusArea[wmClass]) {
        statusArea[wmClass].destroy();
    }
}

function addToTopBar(wmClass)
{
    STANDARD_TRAY_ICON_IMPLEMENTATIONS[wmClass] = wmClass;
}

function _moveTrayIconsToTopBar() {
    let i;
    for (i = 0; i < notification.length; i++) {
        LOG('Add ' + notification[i] + " to top bar");
        addToTopBar(notification[i]);
    }

    // convert existing ones to tray icons.
    for (i = 0; i < Main.notificationDaemon._sources.length; ++i) {
        let source = Main.notificationDaemon._sources[i],
            icon = source.trayIcon;
        if (icon) {
            let wmClass = icon.wm_class ? icon.wm_class.toLowerCase() : '';
            if (notification.indexOf(wmClass) > -1) {
                // NOTE: if I use icon.unparent() it segfaults, but if I use
                // parent.remove_actor(icon) it's fine.
                // Weird!
                icon.get_parent().remove_actor(icon);
                source.destroy();

                // add back to the tray
                _onTrayIconAdded(trayManager, icon);
            }
        }
    }
}

function _moveTrayIconsToMessageTray() {
    for (var i = 0; i < notification.length; i++) {
        removeFromTopBar(notification[i]);
        let icon = trayIcons[notification[i]];
        if (icon) {
            LOG('Remove ' + notification[i] + " from top bar");
            // add back to message tray
            Main.notificationDaemon._onTrayIconAdded(Main.notificationDaemon, icon);
            delete trayIcons[notification[i]];
        }
    }
    trayIcons = {};
}

function init() {
}

function enable() {
    statusArea = Main.panel.statusArea;
    trayManager = Main.notificationDaemon._trayManager;
    addedID = trayManager.connect('tray-icon-added', _onTrayIconAdded);

    _moveTrayIconsToTopBar();
    for (let i = 0; i < removeStatusIcon.length; i++) {
        LOG('Remove ' + removeStatusIcon[i] + " from top bar");
        hideStatusIcon(removeStatusIcon[i]);
    }

    // NOTE: this fix (for icons turning into white squares) from TopIcon:
    // https://extensions.gnome.org/extension/495/topicons/

    // TrayIcons do not survive leaving the stage (they end up as
    // whitesquares), so work around this by temporarily move them back to the
    // message tray while we are in fullscreen.
    fullScreenChangedId = Main.layoutManager.connect(
        'primary-fullscreen-changed', function (o, state) {
            if (state) {
                _moveTrayIconsToMessageTray();
            } else {
                _moveTrayIconsToTopBar();
            }
        });
}

function disable() {
    trayManager.disconnect(addedID);
    addedID = 0;

    _moveTrayIconsToMessageTray();
    for (var i = 0; i < removeStatusIcon.length; i++) {
        LOG('Restore ' + removeStatusIcon[i] + " to top bar");
        showStatusIcon(removeStatusIcon[i]);
    }
    Main.layoutManager.disconnect(fullScreenChangedId);
}
