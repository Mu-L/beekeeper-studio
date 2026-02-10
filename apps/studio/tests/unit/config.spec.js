import {
  convertKeybinding,
  BksConfigProvider,
} from "@/common/bksConfig/BksConfigProvider";
import { ConfigMetadataProvider } from "@/common/bksConfig/ConfigMetadataProvider";
import { parseIni, processRawConfig } from "../../src/config/helpers.mjs";
import _ from "lodash";
import { checkConflicts, checkUnrecognized } from "@/common/bksConfig/mainBksConfig";
import testConfigIni from "../fixtures/bksConfig/config.ini";
import testMetadata from "../fixtures/bksConfig/config-metadata.json";
import fullConfigIni from "../../default.config.ini";
import fullMetadata from "../../config-metadata.json";

/** @type {import("@/common/IPlatformInfo").IPlatformInfo} */
const linuxPlatformInfo = {
  isMac: false,
  isWindows: false,
  isLinux: true,
  platform: "linux",
  isDevelopment: false,
  env: {
    development: false,
    test: true,
    production: false,
  },
};

const macPlatformInfo = {
  ...linuxPlatformInfo,
  isMac: true,
  isWindows: false,
  isLinux: false,
  platform: "mac",
};

describe("Config", () => {
  it("should parse ini file correctly", () => {
    const parsed = parseIni(`
[general]
maxResults = 10

[ui.general]
save = ctrlOrCmd+s
    `);

    const expected = {
      general: {
        maxResults: 10,
      },
      ui: {
        general: {
          save: "ctrlOrCmd+s",
        },
      },
    };

    expect(parsed).toMatchObject(expected);
  });

  it("should convert keybinding syntax correctly", () => {
    expect(convertKeybinding("electron", "ctrlOrCmd+shift+c", "mac")).toBe(
      "CommandOrControl+Shift+C"
    );

    expect(convertKeybinding("v-hotkey", "ctrlOrCmd+shift+c", "mac")).toBe(
      "meta+shift+c"
    );
    expect(convertKeybinding("v-hotkey", "ctrlOrCmd+shift+c", "linux")).toBe(
      "ctrl+shift+c"
    );
    expect(convertKeybinding("v-hotkey", "CtrlOrCmd+Shift+C", "linux")).toBe(
      "ctrl+shift+c"
    );
    expect(convertKeybinding("v-hotkey", "CTRLORCMD+SHIFT+C", "linux")).toBe(
      "ctrl+shift+c"
    );
    expect(
      convertKeybinding("v-hotkey", "CTRLORCMD   +  SHIFT  + C", "linux")
    ).toBe("ctrl+shift+c");
    expect(convertKeybinding("ui", "CTRLORCMD+SHIFT+C", "linux", {
      arrayMode: true,
    })).toStrictEqual(["Ctrl", "Shift", "C"]);
  });

  it("should detect unrecognized config keys", () => {
    const defaultConfig = parseIni(`
[general]
maxResults = 10

[ui.general]
save = ctrlOrCmd+s
    `);

    const userConfig = parseIni(`
[general]
maxResults = 20
minResults = 10

[ui.general]
save = ctrlOrCmd+s
load = ctrlOrCmd+o

[ui.personal]
superiorkey = ctrlOrCmd+c

[generall]
minRes = 10
    `);

    const warnings = checkUnrecognized(defaultConfig, userConfig, "user");
    const expectedWarnings = [
      {
        sourceName: "user",
        type: "unrecognized-key",
        section: "general",
        path: "general.minResults",
      },
      {
        sourceName: "user",
        type: "unrecognized-key",
        section: "generall",
        path: "generall",
      },
      {
        sourceName: "user",
        type: "unrecognized-key",
        section: "ui.general",
        path: "ui.general.load",
      },
      {
        sourceName: "user",
        type: "unrecognized-key",
        section: "ui.personal",
        path: "ui.personal",
      },
    ];

    expect(warnings).toEqual(expectedWarnings);
  });

  it("should recognize plugin configurations", () => {
    const defaultConfig = parseIni(``);
    const userConfig = parseIni(`
[plugins.bks-ai-shell]
enabled = true
    `);

    const warnings = checkUnrecognized(defaultConfig, userConfig, "user");
    expect(warnings).toEqual([]);
  })

  it("should detect conflicts between user and system keys", () => {
    const systemConfig = parseIni(`
[general]
checkForUpdatesInterval = 86400000      ; 24 hours
maxResults = 100

[keybindings.queryEditor]
submitAllQuery = ctrlOrCmd+enter

[ui.tableTable]
pageSize = 100
    `);

    const userConfig = parseIni(`
[general]
maxResults = 200

[keybindings.queryEditor]
submitAllQuery = ctrlOrCmd+shift+enter

[ui.tableTable] ; empty section should not cause a warning
    `);

    const warnings = checkConflicts(userConfig, systemConfig, "user");
    const expectedWarnings = [
      {
        type: "system-user-conflict",
        sourceName: "user",
        section: "general",
        path: "general.maxResults",
      },
      {
        type: "system-user-conflict",
        sourceName: "user",
        section: "keybindings.queryEditor",
        path: "keybindings.queryEditor.submitAllQuery",
      },
    ];
  });

  it("Should create defaults for [db.default] for all connection types", () => {
    const rawConfig = parseIni(`
[db.default]
initialSort = false
    `);

    const processedConfig = processRawConfig(rawConfig);

    const expected = {
      db: {
        default: {
          initialSort: false
        },
        sqlite: {
          initialSort: false
        },
        sqlserver: {
          initialSort: false
        },
        redshift: {
          initialSort: false
        },
        cockroachdb: {
          initialSort: false
        },
        mysql: {
          initialSort: false
        },
        postgres: {
          initialSort: false
        },
        mariadb: {
          initialSort: false
        },
        cassandra: {
          initialSort: false
        },
        oracle: {
          initialSort: false
        },
        bigquery: {
          initialSort: false
        },
        firebird: {
          initialSort: false
        },
        tidb: {
          initialSort: false
        },
        libsql: {
          initialSort: false
        },
        clickhouse: {
          initialSort: false
        },
        duckdb: {
          initialSort: false
        },
        mongodb: {
          initialSort: false
        },
        sqlanywhere: {
          initialSort: false
        },
      }
    };

    expect(processedConfig).toMatchObject(expected);
  })

  it("Should properly parse param types from config", () => {
    const rawConfig = parseIni(`
[db.default.paramTypes]
positional = true
named[] =
numbered[] =
quoted[] =

[db.postgres.paramTypes]
positional = false
numbered[] = '$'

[db.bigquery.paramTypes]
positional = true
named[] = '@'
quoted[] = '@'
    `)

    const processedConfig = processRawConfig(rawConfig);

    const expected = {

      db: {
        default: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        sqlite: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        sqlserver: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        redshift: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        cockroachdb: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        mysql: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        postgres: {
          paramTypes: {
            positional: false,
            named: [],
            numbered: [ '$' ],
            quoted: [],
          }
        },
        mariadb: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        cassandra: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        oracle: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        bigquery: {
          paramTypes: {
            positional: true,
            named: [ '@' ],
            numbered: [],
            quoted: [ '@' ],
          }
        },
        firebird: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        tidb: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        libsql: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        clickhouse: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        duckdb: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        mongodb: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
        sqlanywhere: {
          paramTypes: {
            positional: true,
            named: [],
            numbered: [],
            quoted: [],
          }
        },
      }
    };

    expect(processedConfig).toMatchObject(expected);
  })

  it("should generate all keybindings for UI", () => {
    const raw = parseIni(testConfigIni);
    const processed = processRawConfig(raw);
    const source = {
      defaultConfig: processed,
      systemConfig: {},
      userConfig: {},
      warnings: [],
    };
    const linuxConfig = BksConfigProvider.create(source, linuxPlatformInfo);
    const linuxConfigUI = new ConfigMetadataProvider({
      bksConfig: linuxConfig,
      metadata: testMetadata,
      platformInfo: linuxPlatformInfo,
    });
    expect(linuxConfigUI.getKeybindingSections()).toStrictEqual([
      {
        sectionKey: "keybindings.general",
        label: "General",
        actions: [
          {
            key: "refresh",
            label: "Refresh",
            keybindings: [["F5"], ["Ctrl", "R"]],
          },
        ],
      },
      {
        sectionKey: "keybindings.tab",
        label: "Tabs",
        actions: [
          {
            key: "closeTab",
            label: "Close Tab",
            keybindings: [["Ctrl", "W"]],
          },
          {
            key: "switchTab1",
            label: "Switch to Tab 1",
            keybindings: [["Alt", "1"]],
          },
        ],
      },
      {
        sectionKey: "keybindings.plugins.bks-ai-shell",
        label: "plugins.bks-ai-shell",
        actions: [
          {
            key: "new-tab-dropdown-item",
            label: "new-tab-dropdown-item",
            keybindings: [["Ctrl", "L"]],
          },
        ],
      },
    ]);

    const macConfig = BksConfigProvider.create(source, macPlatformInfo);
    const macConfigUI = new ConfigMetadataProvider({
      bksConfig: macConfig,
      metadata: testMetadata,
      platformInfo: macPlatformInfo,
    });
    const tabSection = macConfigUI
      .getKeybindingSections()
      .find((k) => k.sectionKey === "keybindings.tab");
    expect(tabSection.actions).toStrictEqual([
      {
        key: "closeTab",
        label: "Close Tab",
        keybindings: [["⌘", "W"]],
      },
      {
        key: "switchTab1",
        label: "Switch to Tab 1",
        keybindings: [["⌥", "1"]],
      },
    ]);
  });

  // NOTE: This could be used to test all configs metadata instead of just keybindings
  it("should have labels defined for all keybindings", () => {
    const raw = parseIni(fullConfigIni);
    const processed = processRawConfig(raw);
    const source = {
      defaultConfig: processed,
      systemConfig: {},
      userConfig: {},
      warnings: [],
    };
    const bksConfig = BksConfigProvider.create(source, linuxPlatformInfo);
    const bksConfigUI = new ConfigMetadataProvider({
      bksConfig,
      metadata: fullMetadata,
      platformInfo: linuxPlatformInfo,
    });
    expect(() => bksConfigUI.getKeybindingSections()).not.toThrow();
  });
});
