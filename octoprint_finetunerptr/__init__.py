# coding=utf-8
from __future__ import absolute_import
import octoprint.plugin
import octoprint.server

class FineTuneRptrPlugin(octoprint.plugin.AssetPlugin,
                                      octoprint.plugin.TemplatePlugin):
    def get_assets(self):
        return dict( js=[
            "js/util.js",
            "js/categorizedEeprom.js",
            "js/finetunerptr.js"],
            css=["css/style.css"]
        )

    def get_template_configs(self):
        return [ dict(type="navbar", template="finetunerptr.html.j2", custom_bindings=True) ]

    def get_update_information(self):
    	return dict(
            RepetierMaintenanceHelper=dict(
                displayName="FineTuneRptr",
                displayVersion=self._plugin_version,
                type="github_release",
                user="xyzaxyz",
                repo="OctoPrint-Finetunerptr",
                current=self._plugin_version,
                pip="https://github.com/xyzaxyz/OctoPrint-Finetunerptr/archive/{target_version}.zip"
            )
        )

__plugin_name__ = "FineTuneRptr"

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = FineTuneRptrPlugin()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}
