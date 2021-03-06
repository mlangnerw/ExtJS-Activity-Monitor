/**
 * @class Ext.ux.ActivityMonitor
 * @author Arthur Kay (http://www.akawebdesign.com)
 * @singleton
 * @version 1.0
 *
 * GitHub Project: https://github.com/arthurakay/ExtJS-Activity-Monitor
 */
Ext.define('Ext.ux.ActivityMonitor', {
    singleton   : true,

    ui          : null,
    runner      : null,
    task        : null,
    lastActive  : null,
    
    ready       : false,
    verbose     : false,
    interval    : (1000 * 60 * 1), //1 minute
    maxInactive : (1000 * 60 * 5), //5 minutes
    keepRunning : false,
    inactive    : false,
    listeners   : false,
    
    init : function(config) {
        if (!config) { config = {}; }
        
        Ext.apply(this, config, {
            runner     : new Ext.util.TaskRunner(),
            ui         : Ext.getBody(),
            task       : {
                run      : this.monitorUI,
                interval : config.interval || this.interval,
                scope    : this
            }
        });
        
        this.ready = true;
    },
    
    isReady : function() {
        return this.ready;
    },
    
    isActive   : Ext.emptyFn,
    isInactive : Ext.emptyFn,
    isBack     : Ext.emptyFn,
    
    start : function() {
        if (!this.isReady()) {
            this.log('Please run ActivityMonitor.init()');
            return false;
        }
        
        if (!this.listeners) {
            this.ui.on('mousemove', this.captureActivity, this);
            this.ui.on('keydown', this.captureActivity, this);
        }
        
        this.lastActive = new Date();
        this.log('ActivityMonitor has been started.');
        
        this.runner.start(this.task);
        return true;
    },
    
    stop : function() {
        if (!this.isReady()) {
            this.log('Please run ActivityMonitor.init()');
            return false;
        }
        
        this.runner.stop(this.task);
        this.lastActive = null;
        this.inactive = true;
        
        if (!this.keepRunning) {
            this.ui.un('mousemove', this.captureActivity);
            this.ui.un('keydown', this.captureActivity);
        }
        
        this.log('ActivityMonitor has been stopped.');
        return true;
    },
    
    captureActivity : function(eventObj, el, eventOptions) {
        if (this.inactive && this.lastActive===null) {
            this.start();
        }
        this.lastActive = new Date();
    },
    
    monitorUI : function() {
        var now      = new Date(),
            inactive = (now - this.lastActive);
        
        if (inactive >= this.maxInactive) {
            this.log('MAXIMUM INACTIVE TIME HAS BEEN REACHED');
            this.stop(); //remove event listeners
            
            this.isInactive();
        }
        else {
            if (this.inactive) {
                this.log('USER IS BACK AGAIN');
                this.inactive = false;
                this.isBack();
            } else {
                this.log('CURRENTLY INACTIVE FOR ' + inactive + ' (ms)');
            }
            this.isActive();
        }
    },
    
    log : function(msg) {
        if (this.verbose) {
            window.console.log(msg);
        }
    }
    
});
