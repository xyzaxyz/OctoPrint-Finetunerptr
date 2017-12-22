/* ########################################################
 *
 *             FineTuneRptr   |     04/2017
 *  Author: Andreas Bruckmann | License: AGPLv3
 *
 * ########################################################
 *
 *  Keeps important calibration settings always accessible.
 *  As it's not integrated to any subpage, tab or settings,
 *  you can easily use it from whichever page in OctoPrint.
 *
 * ########################################################
 *
 *  Making Use of:
 *  OctoPrint EEPROM Editor by Salandora https://github.com/Salandora/OctoPrint-EEPROM-Repetier
 *  FontAwesome Icons http://fontawesome.io/3.2.1/icons/
 *  Accordion: Bootstrap https://www.w3schools.com/bootstrap/bootstrap_collapse.asp
 *  OctoPrint API http://docs.octoprint.org/en/master/jsclientlib/index.html
 *
 * ########################################################
 *
 */

/*
     TODO:
       - Export/Import Full EEPROM compatible for Repetier Host
       - Settings hier abspeichern http://docs.octoprint.org/en/master/plugins/mixins.html#settingsplugin
         statt localStorage

     BUG.S:
      - Wenn EEPROM geladen wird, werden Favoriten angezeigt und in ihrer normalen Kategorie
        sind die Einträge noch vorhanden.
        Wenn man wieder lädt, verschwinden die Einträge aus den ursprünglichen Kategorien.
*/

$(function() {
    function FinetunerptrViewModel(parameters) {
        // Variables ######################################################################################
        var self = this;
        self.control = parameters[0];
        self.connection = parameters[1];
        self.isRepetierFirmware = ko.observable(false);

        self.isConnected = ko.computed(function() {
            return self.connection.isOperational() || self.connection.isPrinting() ||
                self.connection.isReady() || self.connection.isPaused();
        });


        self.categorizedEeprom = ko.observableArray(categorizedEeprom);

        self.loadedEepromSettingsCounter = ko.observable(0);
        self.eepromLoaded = ko.computed(function() {
            return (self.loadedEepromSettingsCounter() > 51);
        });

        // Methods ######################################################################################
        // Show Panel Dropdown
        self.toggleNavbarDropdownPanel = function(strict) {
            toggleNavbarDropdownPanel(strict);
        }

        // EEPROM Accordion Dropdown
        self.collapseAllBootstrapAccordionPanels = function() {
            collapseAllBootstrapAccordionPanels()
        };

        // data = element to handle , method = 1=add / 0=delete
        // data can be passed from frontend as "addToFavorites"
        self.updateFavorites = function(data, method) {
            updateFavorites(data, method).then(_localStorageData =>
            self.scopeFavorites(_localStorageData.eepromFavorites));
        };


        self.scopeFavorites = function(favArray) {
            return new Promise(function(resolve, reject) {
                let promises = [];
                self.categorizedEeprom()[0].EEPROM_Values = ko.observableArray([]);
                self.categorizedEeprom()[0].EEPROM_Descriptions = ko.observableArray([]);
                self.categorizedEeprom()[0].EEPROM_Descriptions = ko.observableArray(favArray);

                for (var favArrCount = 0; favArrCount < favArray.length; favArrCount++) {
                    let prom = new Promise(function(resolve, reject) {
                        self.getEepromValue(favArray[favArrCount])
                            .then(function(dataObj) {
                                var eepromValuesObj = {
                                    'category': dataObj.category,
                                    'description': dataObj.description,
                                    'value': dataObj.value,
                                    'Icon': dataObj.Icon,
                                    'dataType': dataObj.dataType,
                                    'origValue': dataObj.origValue,
                                    'position': dataObj.position,
                                };
                                resolve(eepromValuesObj);
                            });
                    });
                    promises.push(prom);
                }
                Promise.all(promises).then(function(values) {
                    self.categorizedEeprom()[0].EEPROM_Values([]);
                    for (let v in values) {
                        self.categorizedEeprom()[0].EEPROM_Values.push(values[v]);
                    }
                    resolve(self.categorizedEeprom()[0].EEPROM_Values);
                });
            });
        };

        self.getEepromValue = function(description) {
            return new Promise(function(resolve, reject) {
                var output = {};
                for (var i = 0; i < self.categorizedEeprom().length; i++) {
                    for (var j = 0; j < self.categorizedEeprom()[i].EEPROM_Values().length; j++) {
                        if (self.categorizedEeprom()[i].EEPROM_Values()[j].description == description) {
                            self.categorizedEeprom()[i].EEPROM_Values()[j].Icon = self.categorizedEeprom()[i].Icon;
                            output = self.categorizedEeprom()[i].EEPROM_Values()[j];
                            resolve(output);
                        }
                    }
                }
                reject("Error:: " + description);
            });
        };

        // Motors Off
        self.setPrinterRepetierMotorsOff = function() {
            self.control.sendCustomCommand({
                command: 'M84'
            });
        };

        //  Printer Home XY
        self.setPrinterHomeXY = function() {
            self.control.sendCustomCommand({
                command: 'G28 X0 Y0'
            });
        };

        // EEPROM Methods
        self.fromHistoryData = function(data) {
            _.each(data.logs, function(line) {
                fromCurrentData_noRFw(line);
            });
        };
        self.fromCurrentData = function(data) {
            if (!self.isRepetierFirmware()) {
                _.each(data.logs, function(line) {
                    fromCurrentData_noRFw(line);
                });
            } else {
                _.each(data.logs, function(line) {
                    fromCurrentData_isRFw(line);
                });
            }
        };
        var fromCurrentData_noRFw = function(line) {
            var match = /FIRMWARE_NAME:([^\s]+)/i.exec(line);
            if (match) {
                if (/Repetier_([^\s]*)/i.exec(match[0]))
                    self.isRepetierFirmware(true);
            }
        };
        var fromCurrentData_isRFw = function(line) {
            var match = /EPR:(\d+) (\d+) ([^\s]+) (.+)/.exec(line);
            if (match) {
                var description = match[4];
                categorizeEepromReading(match[4])
                    .then(function(category) {
                        regexPushObject(category, match);
                    })
            }
        }

        var categorizeEepromReading = function(description) {
            return new Promise(function(resolve, reject) {
                for (var i = 0; i < self.categorizedEeprom().length; i++) {
                    if (self.categorizedEeprom()[i].EEPROM_Descriptions.indexOf(description) != -1) {
                        resolve(self.categorizedEeprom()[i].Name);
                    }
                }
                resolve("Other");
            });
        };

        var regexPushObject = function(category, match) {
            for (var i = 0; i < self.categorizedEeprom().length; i++) {
                if (self.categorizedEeprom()[i].Name == category) {
                    var outputObj = {
                        dataType: match[1],
                        position: match[2],
                        origValue: match[3],
                        value: match[3],
                        description: match[4],
                        category: category,
                    };
                    self.categorizedEeprom()[i].EEPROM_Values.push(outputObj);
                }
            }
            self.loadedEepromSettingsCounter(self.loadedEepromSettingsCounter() + 1);
            if (self.loadedEepromSettingsCounter() == 52) {
                self.updateFavorites();
            }
        };

        self.loadEeprom = function() {
            (function() {
                return new Promise(function(resolve, reject) {
                    //first reset/clear everything
                    for (var l = 0; l < self.categorizedEeprom().length; l++) {
                        self.categorizedEeprom()[l].EEPROM_Values([]);
                    }
                    if (l == self.categorizedEeprom().length || !self.eepromLoaded()) {
                        resolve(self.categorizedEeprom());
                    }
                });
            })()
            .then(function() {
                self._requestEepromData();
            });
        };

        self.saveEeprom = function() {
            for (let i in self.categorizedEeprom()) {
                for (let j in self.categorizedEeprom()[i].EEPROM_Values()) {
                    var valObj = self.categorizedEeprom()[i].EEPROM_Values()[j];
                    if (valObj.origValue !== valObj.value) {
                        self._requestSaveDataToEeprom(valObj.dataType, valObj.position, valObj.value);
                        valObj.origValue = valObj.value;
                    }
                }
            }
        };

        self._requestFirmwareInfo = function() {
            self.control.sendCustomCommand({
                command: "M115"
            });
        };
        self._requestEepromData = function() {
            self.control.sendCustomCommand({
                command: "M205"
            });
        };
        self._requestSaveDataToEeprom = function(data_type, position, value) {
            var cmd = "M206 T" + data_type + " P" + position;
            if (data_type == 3) {
                cmd += " X" + value;
                self.control.sendCustomCommand({
                    command: cmd
                });
            } else {
                cmd += " S" + value;
                self.control.sendCustomCommand({
                    command: cmd
                });
            }
        };

        // EventHandlers ################################################################################
        self.onEventConnected = function() {
            self._requestFirmwareInfo();
        };
        self.onEventDisconnected = function() {
            self.isRepetierFirmware(false);
        };
        self.onStartup = function() {
            $('#navbar_plugin_octoprint_finetunerptr a').on('click', function(e) {
                if (self.isConnected() && !self.isRepetierFirmware()) {
                    self._requestFirmwareInfo();
                }
            });
        };
    }
    OCTOPRINT_VIEWMODELS.push({
        construct: FinetunerptrViewModel,
        dependencies: ["controlViewModel", "connectionViewModel"],
        elements: ["#navbar_plugin_octoprint_finetunerptr"]
    });
});
