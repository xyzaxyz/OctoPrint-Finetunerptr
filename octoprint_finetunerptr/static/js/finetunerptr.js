/* ########################################################
 * OctoPrint-RepetierMaintenanceHelper
 * Created on 15.04.2017
 *
 * Author: Andreas Bruckmann
 * License: AGPLv3
 * ########################################################
 *              Inspirations / Making Use of:
 *     https://gist.github.com/bradmontgomery/2219997
 *  https://github.com/Salandora/OctoPrint-EEPROM-Repetier
 * ########################################################
 */

/*
     TODO:
       - Testsystem: Kein Extruder und Heatbed vorhanden, diese Kategorien müssen noch kommen
       - Kategorie "Other" für nicht erkannte einrichten
       - Export/Import Full EEPROM nach Repetier Host kompatiblem Format

     BUG:
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
      self.firmwareRegEx = /FIRMWARE_NAME:([^\s]+)/i;
      self.repetierRegEx = /Repetier_([^\s]*)/i;
      self.eepromDataRegEx = /EPR:(\d+) (\d+) ([^\s]+) (.+)/;
      self.isRepetierFirmware = ko.observable(false);

      self.isConnected = ko.computed(function() {
         return self.connection.isOperational() || self.connection.isPrinting() ||
            self.connection.isReady() || self.connection.isPaused();
      });


      self.categorizedEeprom = ko.observableArray(categorizedEeprom);

      self.loadedEepromSettingsCounter = ko.observable(0);
      self.eepromLoaded = ko.computed(function() {
         return (self.loadedEepromSettingsCounter() > 51) ? true : false;
      });


      self.updateFavorites = function(data) {updateFavorites(data)};
      // Methods ######################################################################################

      self.fromHistoryData = function(data) {
         _.each(data.logs, (line) {
            fromCurrentData_noRFw(line)
         });
      };
      self.fromCurrentData = function(data) {
         if (!self.isRepetierFirmware()) {
            _.each(data.logs, function(line) {
               fromCurrentData_noRFw(line)
            });
         } else {
            _.each(data.logs, function(line)  {
               fromCurrentData_isRFw(line)
            });
         }
      };
      var fromCurrentData_noRFw = function(line)  {
         var match = self.firmwareRegEx.exec(line);
         if (match) {
            if (self.repetierRegEx.exec(match[0]))
               self.isRepetierFirmware(true);
         }
      };
      var fromCurrentData_isRFw = function(line)  {
         var match = self.eepromDataRegEx.exec(line);
         if (match) {
            var description = match[4];
            categorizeEepromReading(match[4])
               .then(function(category)  {
                  regexPushObject(category, match);
               })
         }
      }

      var categorizeEepromReading = function(description)  {
         //  console.log("#categorizeEepromReading");
         return new Promise(function(resolve, reject) {
            for (var i = 0; i < self.categorizedEeprom().length; i++) {
               if (self.categorizedEeprom()[i].EEPROM_Descriptions.indexOf(description) != -1) {
                  resolve(self.categorizedEeprom()[i].Name);
               }
            }
            resolve("Other");
         });
      };

      var regexPushObject = function(category, match)  {
         //  console.log("#regexPushObject"); //,category,match);
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

      // (js/util.js)
      self.collapseAllBootstrapAccordionPanels = function() {collapseAllBootstrapAccordionPanels()};
      self.addToFav = function(data){addToFav(data);} // util.js

      self.loadEeprom = function()  {
         (function() {
            return new Promise(function(resolve, reject) {
               for (var l = 0; l < self.categorizedEeprom().length; l++) {
                  self.categorizedEeprom()[l].EEPROM_Values([]);
               }
               if (l == self.categorizedEeprom().length || !self.eepromLoaded()) {
                  resolve(self.categorizedEeprom());
               }
            });
         })()
         .then(function()  {
            console.log("Loading EEPROM");
            self._requestEepromData();
         });
      };

      self.saveEeprom = function()  {
         console.log("Saving EEPROM");
         //  console.log("TODO:: Implement SaveEEPROM");
         for (let i in self.categorizedEeprom()) {
            for (let j in self.categorizedEeprom()[i].EEPROM_Values()) {
               var valObj = self.categorizedEeprom()[i].EEPROM_Values()[j];
               if (valObj.origValue !== valObj.value) {
                  console.log("Change detected: ", valObj.value, valObj.origValue, valObj, i, j);
                  self._requestSaveDataToEeprom(valObj.dataType, valObj.position, valObj.value);
                  valObj.origValue = valObj.value;
               }
            }
         }
      };

      self._requestFirmwareInfo = function() {self.control.sendCustomCommand({
         command: "M115"
      });
    };
      self._requestEepromData = function() {self.control.sendCustomCommand({
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
      self.onEventConnected = function() { self._requestFirmwareInfo();};
      self.onEventDisconnected = function()  {self.isRepetierFirmware(false);};
      self.onStartup = function() {
         //  console.log("tab_plugin_octoprint_RepetierMaintenanceHelper startUp");
         $('#tab_plugin_octoprint_RepetierMaintenanceHelper a').on('show', function(e) {
            if (self.isConnected() && !self.isRepetierFirmware()) {
               self._requestFirmwareInfo();
            }
         });
      };

   }

   OCTOPRINT_VIEWMODELS.push([
      FinetunerptrViewModel, ["controlViewModel", "connectionViewModel"],
      "#tab_plugin_octoprint_RepetierMaintenanceHelper"
   ]);
});
