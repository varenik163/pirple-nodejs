const readline = require('readline');
const events = require('events');
const util = require('util');
const os = require('os');
const v8 = require('v8');
const _data = require('./data');

util.debuglog('cli');

class _events extends events {}

const e = new _events();

const cli = {};
cli.responders = {};

const uniqueInputs = [
  'man',
  'help',
  'exit',
  'stats',
  'list users',
  'more user info',
  'list checks',
  'more check info',
  'list logs',
  'more log info',
];

cli.printHeader = (str) => {
  cli.horizontalLine();
  cli.centered(str);
  cli.horizontalLine();
  cli.verticalSpace();
};

cli.printObject = (obj) => {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    let line = `\x1b[34m${key}\x1b[0m `;
    line += '.'.repeat(50 - line.length) + ' ';
    line += value;
    console.log(line);
  });
};

cli.horizontalLine = () => {
  const width = process.stdout.columns;
  console.log('_'.repeat(width));
};
cli.centered = (str) => {
  const width = process.stdout.columns;
  const padding = Math.floor((width - str.length) / 2);

  console.log(' '.repeat(padding) + str);
};
cli.verticalSpace = (lines = 2) => {
  if (lines <= 0) return;
  let count = Number(lines);
  while (count) {
    console.log('');
    count = count - 1;
  }
};

// Help / Man
cli.responders.help = () => {
  cli.printHeader('Available commands');
  const commands = {
    'man/help': 'show Help page',
    'exit': 'kill the CLI and the server',
    'stats': 'get statistic',
    'list users': 'show a list of all users in the system',
    'more user info --{userId}': 'show user details',
    'list checks': 'show a list of all active checks in the system',
    'more check info --{checkId}': 'show check info',
    'list logs': 'show log files',
    'more log info': 'show specific log info',
  };
  cli.printObject(commands);
};

// Exit
cli.responders.exit = () => {
  process.exit(0);
};

// Stats
cli.responders.stats = () => {
  const loadavg = os.loadavg();
  const cpus = os.cpus();
  const freemem = os.freemem();
  const heapStatistic = v8.getHeapStatistics();

  const stats = {
    'Load Average': loadavg.join(' '),
    'CPU Count': cpus.length,
    'Free Memory': freemem,
    'Current Malloced Memory': heapStatistic.malloced_memory,
    'Peak Malloced Memory': heapStatistic.peak_malloced_memory,
    'Allocated heap Used': Math.round((heapStatistic.used_heap_size / heapStatistic.total_heap_size) * 100) + '%',
    'Available Heap Allocated':  Math.round((heapStatistic.total_heap_size / heapStatistic.heap_size_limit) * 100) + '%',
    'Uptime': os.uptime() + ' secs'
  };
  cli.printHeader('System Statistics');
  cli.printObject(stats);
};

// list users
cli.responders.listUsers = () => {
  cli.printHeader('Users');
  _data.list('users', ((err, ids = []) => {
    if (err) return console.log(err);
    ids.forEach(id => {
      _data.read('users', id, (err, userData) => {
        if (err) return console.log(err);
        cli.verticalSpace(1);
        cli.printObject(userData);
        cli.verticalSpace(1);
      });
    })
  }));
};

// more user info
cli.responders.moreUserInfo = (str) => {
  const userId = str.split('--')[1];

  if (!userId) return console.log('Missing required parameter --{userId}');

  _data.read('users', userId, (err, userData) => {
    if (err) console.error(err);

    cli.verticalSpace(1);
    if (userData) cli.printObject(userData);
    cli.verticalSpace(1);
  });
};

// list checks
cli.responders.listChecks = () => {
  cli.printHeader('Checks');
  _data.list('checks', ((err, ids = []) => {
    if (err) return console.log(err);
    ids.forEach(id => {
      _data.read('checks', id, (err, data) => {
        if (err) return console.log(err);
        cli.verticalSpace(1);
        cli.printObject(data);
        cli.verticalSpace(1);
      });
    })
  }));
};

// more check info
cli.responders.moreCheckInfo = (str) => {
  const checkId = str.split('--')[1];

  if (!checkId) return console.log('Missing required parameter --{checkId}');

  _data.read('checks', checkId, (err, data) => {
    if (err) console.error(err);

    cli.verticalSpace(1);
    if (data) cli.printObject(data);
    cli.verticalSpace(1);
  });
};

// list logs
cli.responders.listLogs = (str) => {
  cli.printHeader('Logs');
};

// more log info
cli.responders.moreLogInfo = (str) => {
  console.log('You asked for ', str);
};

e.on('man', cli.responders.help);
e.on('help', cli.responders.help);
e.on('exit', cli.responders.exit);
e.on('stats', cli.responders.stats);
e.on('list users', cli.responders.listUsers);
e.on('more user info', cli.responders.moreUserInfo);
e.on('list checks', cli.responders.listChecks);
e.on('more check info', cli.responders.moreCheckInfo);
e.on('list logs', cli.responders.listLogs);
e.on('more log info', cli.responders.moreLogInfo);

cli.processInput = (str) => {
  if (!str) return false;

  const foundMatch = uniqueInputs.find(input => !!str.toLowerCase().includes(input));

  if (!foundMatch) {
    console.log(`Sorry, command ${str} not found`);
    e.emit('help', str);
  }
  else e.emit(foundMatch, str);

  return true;
};

cli.init = () => {
  console.log(
    '\x1b[34m%s\x1b[0m',
    `The CLI is running`
  );

  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Pirple CLI: '
  });

  _interface.prompt();

  _interface.on('line', (str) => {
    cli.processInput(str);
    _interface.prompt();
  });

  _interface.on('close', () => {
    process.emit(0);
  });
};

module.exports = cli;
