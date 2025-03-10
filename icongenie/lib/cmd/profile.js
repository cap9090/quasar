
const parseArgs = require('minimist')

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    o: 'output',
    a: 'assets',

    i: 'icon',
    b: 'background',
    f: 'filter',
    q: 'quality',
    h: 'help'
  },
  boolean: [ 'h', 'skip-trim' ],
  string: [
    'o', 'a',
    'i', 'b', 'include', 'f', 'q',
    'padding',
    'theme-color',
    'png-color',
    'splashscreen-color',
    'svg-color',
    'splashscreen-icon-ratio'
  ]
})

if (argv.help) {
  const modes = Object.keys(require('../modes')).join('|')
  const generators = Object.keys(require('../generators')).join('|')
  const defaultParams = require('../utils/default-params')

  console.log(`
  Description
    Helper command to easily bootstrap Icon Genie profile files.

  Usage
    $ icongenie profile -o <filename> [options]

    # supplying params list
    $ icongenie profile -o <filename> --include pwa,spa --quality 7

    # supplying assets based on Icon Genie's internal list
    $ icongenie profile -o <filename> --assets spa,bex

  Options
    --output, -o          Name of the new Icon Genie profile file

    --assets, -a          Prefill the assets Array with Icon Genie's
                          internal list, based on the modes that you indicate;
                            [all|${modes}]
                          Multiple can be specified, separated by ",":
                            spa,cordova

    --icon, -i            Path to source file for icons; must be:
                            - a .png file
                            - min resolution: 64x64 px (the higher the better!!)
                            - with transparency
                          Best results are with a square image (height = width)
                          Image will be trimmed automatically
                            (also see "skip-trim" and "padding" param)
                          Path can be absolute, or relative to the root of the
                            Quasar project folder
                          Recommended min size: 1024x1024 px

    --background, -b      Path to optional background source file (for splashscreens);
                          must be:
                            - a .png file
                            - min resolution: 128x128 px (the higher the better!!)
                            - transparency is optional (but recommended if you
                              combine with the splashscreen-color param)
                          Path can be absolute, or relative to the root of the
                            Quasar project folder
                          Recommended min size: 1024x1024 px

    --include             Prefill the params.include property;
                            [all|${modes}]
                          Multiple can be specified, separated by ",":
                            spa,cordova

    --filter, -f          Prefill the params.filter property;
                            [${generators}]

    --quality             Prefill in the params.quality property;
                          Quality of the files [1 - 12] (default: ${defaultParams.quality})
                            - higher quality --> bigger filesize & slower to create
                            - lower quality  --> smaller filesize & faster to create

    --skip-trim           Do not trim the icon source file

    --padding             Apply fixed padding to the icon after trimming it;
                          Syntax: <horiz: number>,<vert: number>
                          Default: 0,0
                          Example: "--padding 10,5" means apply 10px padding to top
                            10px to bottom, 5px to left side and 5px to rightside

    --theme-color         Prefill the params.themeColor property;
                          Theme color to use for all generators requiring a color;
                          It gets overridden if any generator color is also specified;
                          The color must be in hex format (NOT hexa) without the leading
                          '#' character. Transparency not allowed.
                          Examples: 1976D2, eee

    --svg-color           Prefill the params.svgColor property;
                          Color to use for the generated monochrome svgs
                          Default (if no theme-color is specified): ${defaultParams.svgColor.slice(1)}
                          The color must be in hex format (NOT hexa) without the leading
                          '#' character. Transparency not allowed.
                          Examples: 1976D2, eee

    --png-color           Prefill the params.pngColor property;
                          Background color to use for the png generator, when
                          "background: true" in the asset definition (like for
                          the Cordova/Capacitor iOS icons);
                          Default (if no theme-color is specified): ${defaultParams.pngColor.slice(1)}
                          The color must be in hex format (NOT hexa) without the leading
                          '#' character. Transparency not allowed.
                          Examples: 1976D2, eee

    --splashscreen-color  Prefill the params.splashscreenColor property;
                          Background color to use for the splashscreen generator;
                          Default (if no theme-color is specified): ${defaultParams.splashscreenColor.slice(1)}
                          The color must be in hex format (NOT hexa) without the leading
                          '#' character. Transparency not allowed.
                          Examples: 1976D2, eee

    --splashscreen-icon-ratio  Prefill the params.splashscreenIconRatio property;
                               Ratio of icon size in respect to the width or height
                               (whichever is smaller) of the resulting splashscreen;
                               Represents percentages; Valid values: 0 - 100
                               If 0 then it doesn't add the icon of top of background
                               Default: ${defaultParams.splashscreenIconRatio}
  `)
  process.exit(0)
}

const profile = require('../runner/profile')
const filterArgvParams = require('../utils/filter-argv-params')
const parseArgv = require('../utils/parse-argv')

parseArgv(argv, [
  'output',
  'assets',
  'padding'
])

const params = filterArgvParams(argv)

profile(params)
