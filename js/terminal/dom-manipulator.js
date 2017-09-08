function DomManipulator() {
  this.terminal      = document.getElementById("terminal");
  this.terminalInput = document.getElementById("terminal--input");
}

DomManipulator.prototype.getInputValue = function () {
  return this.terminalInput.value;
};

DomManipulator.prototype.setInputValue = function (value) {
  setTimeout(() => {
    this.terminalInput.value = value;
    this.terminalInput.focus();
  }, 1);
};

DomManipulator.prototype.setFocusToInput = function () {
  this.terminalInput.focus();
};

/* global networkFromCodes getNetworkMap */
DomManipulator.prototype.showCommandHelp = function (cmd) {
  this.showSubmittedValue();

  if (cmd === 'help') {
    this.createParagraph("<div>NAME</div>"
    + "<div class='pad'><b>help</b> -- Display list of options</div>"
    + "<div>SYNOPSIS</div>"
    + "<div class='pad'><b>help</b> [COMMAND]</div>"
    + "<div>DESCRIPTION</div>"
    + "<div class='pad'><b>help</b> is a command to display list of available options."
    + "<br/><br/>The user can provide [COMMAND] to get details about particular [COMMAND].</div>");
  } else if (cmd === 'nmap') {
    this.createParagraph("<div>NAME</div>"
    + "<div class='pad'><b>nmap</b> -- Display the map of network nodes</div>"
    + "<div>SYNOPSIS</div>"
    + "<div class='pad'><b>nmap</b> [NODE_CODE ...]</div>"
    + "<div>DESCRIPTION</div>"
    + "<div class='pad'><b>nmap</b> is a command to display the map of network nodes. The user must provide node codes [NODE_CODE] to include node details and hints on the map. "
    + "<br/><br/>The code structure is built of 5 hex values preceded with `0x`. "
    + "<br/><br/>There are 4 types of hints that can be shown on the map: [Sectors], [Target], [Traps] and [Connections]. "
    + "<br/><br/>The <b>nmap</b> command accepts multiple codes with or without preceded `0x`.</div>"
    + "<div>EXAMPLES</div>"
    + "<div class='pad'>The following is how to display map of nodes with [Sectors], [Traps] and [Connections]:</div>"
    + "<div class='pad'>`nmap 0xC16F8 D1234 EF4D0`</div>");
    let network = networkFromCodes("0xC16F8 D1234 EF4D0".split(" "));
    this.createParagraph(getNetworkMap(network) + this.prepareTopLegend() + this.prepareBtmLegend(network), "terminal--map");
  } else if (cmd === 'top') {
    this.createParagraph("<div>NAME</div>"
    + "<div class='pad'><b>top</b> -- Display list of top hacker teams' scores.</div>"
    + "<div>SYNOPSIS</div>"
    + "<div class='pad'><b>top</b> [NETWORK_TOP_HACKER_CODE] [TEAM_NAME]</div>"
    + "<div>DESCRIPTION</div>"
    + "<div class='pad'>The <b>top</b> command displays list of the scores of top hackers teams."
    + "<br/><br/>If the NETWORK_TOP_HACKER_CODE and optionally TEAM_NAME is provided new top score record will be added, so hackers team can compare their performance with the best of the best.</div>"
    + "<div>EXAMPLES</div>"
    + "<div class='pad'>The following is how to add your noob score to top hackers list:</div>"
    + "<div class='pad'>`top 0xF0020F N00BS`</div>");
  } else {
    this.createParagraph("No help entry for " + cmd);
  }

  this.setInputValue("");
};

DomManipulator.prototype.showOptionsList = function () {
  this.showSubmittedValue();
  this.createParagraph("<div>List of available commands:</div>"
  + "<div class='pad'>- <b>nmap [NODE_CODE...]</b> -- Display the map of network nodes</div>"
  + "<div class='pad'>- <b>help [COMMAND]</b> -- Display detailed help for given command or list of available commands.</div>"
  + "<div class='pad'>- <b>top</b> -- Display list of top hacker teams' scores.</div>");
  this.setInputValue("");
};

DomManipulator.prototype.showCommandNotFound = function () {
  this.showSubmittedValue();
  this.createParagraph("COMMAND NOT FOUND: " + this.getInputValue());
  this.setInputValue("");
};

DomManipulator.prototype.showMap = function (codes) {
  this.showSubmittedValue();
  let network = networkFromCodes(codes);
  // map 0xD1234 0xC16F8 0xEF4D0 0xB129A correct
  // map 0xF298E 0xEF4D0 0x1298E 0x44206 invalid
  this.createParagraph("MAP OF THE NETWORK:");
  this.createParagraph(getNetworkMap(network) + this.prepareTopLegend() + this.prepareBtmLegend(network), "terminal--map");
  this.showErrors(codes, network.errors);
  this.setInputValue("");
};


// 1. read code from args (may be empty)
// 2. read name from args (may be empty)
// 3. if code is present try to read score from it
// 3a. if invalid, keep the error
// 3b. if valid, keep the score
// 4. get top scores (with current score included to be saved)
// 5. print top scores (including current one, marked)
// 6. print errors if any

/* global getTopScores codeToScore */
DomManipulator.prototype.showTopScore = function (args) {
  this.showSubmittedValue();

  let code = args[0];
  let name = args.slice(1).join(" ");

  let error;

  if (code) {
    try {
      // TODO: validate in getTopScores?
      codeToScore(code); // just validate the code
      code = formatCode(code);
    } catch(e) {
      error = "<b>" + code + "</b> is not a valid NETWORK_TOP_HACKER_CODE. You can get one after successfully hacking the network.";
      code = null;
    }
  }

  let scores = getTopScores(code, name);

  this.createParagraph("TOP HACKERS");
  this.createParagraph("=============");

  this.createParagraph("&nbsp;&nbsp;&nbsp;<span class='col'>TIME LEFT:</span> <span class='col'>SWITCHES:</span> <span>TEAM:</span>");
  scores.forEach((s) => {

    this.createParagraph(
      (s.code === formatCode(args[0]) ? "~&nbsp;" : "&nbsp;&nbsp;") +
       " <span class='col'>" + `0${~~(s.time / 60)}:${(s.time % 60)<10?'0':''}${s.time % 60}` +
       "</span> <span class='col'>" + s.moves +
       "</span> <span>" + (s.name || 'Anonymous') + "</span>");
  });

  if (error) {
    this.createParagraph(error);
  }

  this.setInputValue("");
};

DomManipulator.prototype.showErrors = function (codes, errors) {
  if (!codes.length) {
    this.createParagraph("Network codes not provided.");
    return;
  }
  if (!errors || !errors.length) return;

  errors.forEach((error) => this.createParagraph('<b>'+ error + '</b> is not a valid NODE_CODE.'));
};

function formatCode(code) {
  return code ? '0x' + code.replace('0x','').toUpperCase() : 'unknown';
}

DomManipulator.prototype.prepareBtmLegend = function (network) {

  function formatLine(colorClass, name, code) {
    return "<li class='" + colorClass + "'>["+ formatCode(code) +"] " + name + "</li>";
  }

  let result = "<ul class='terminal--map-legend'>";
  if (network.colors && network.colors.length) {
    result = result + formatLine('color-springgreen', 'Sectors', network.colors.code);
  } else {
    result = result + formatLine('color-red', 'Sectors');
  }

  if (network.target && network.target.length) {
    result = result + formatLine('color-springgreen', 'Target coordinates', network.target.code);
  } else {
    result = result + formatLine('color-red', 'Target coordinates');
  }

  if (network.traps) {
    result = result + formatLine('color-springgreen', 'Traps', network.traps.code);
  } else {
    result = result + formatLine('color-red', 'Traps');
  }

  if (network.walls) {
    result = result + formatLine('color-springgreen', 'Connections', network.walls.code);
  } else {
    result = result + formatLine('color-red', 'Connections');
  }

  return result + "</ul>";
};

DomManipulator.prototype.prepareTopLegend = function () {
  let result = "<div class='terminal--map-legend-top'>Legend:<ul>";
  result = result + "<li>&#9670; - node</li>";
  result = result + "<li>| - connection</li>";
  result = result + "<li>&#8709; - trap</li>";
  result = result + "<li>X - target</li>";

  return result + "</ul></div>";
};

DomManipulator.prototype.showSubmittedValue = function () {
  this.createParagraph("<span class='color-green'>> " + this.getInputValue() + "</span>");
};

DomManipulator.prototype.createParagraph = function (innerHtml, classNames = "", parentNode = this.terminal) {
  let p = document.createElement("p");
  p.setAttribute("class", "out " + classNames);
  p.innerHTML = innerHtml;
  parentNode.appendChild(p);
};

DomManipulator.prototype.scrollToBottom = function () {
  window.scrollTo(0, document.body.scrollHeight);
};
