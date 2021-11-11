const helpers = require('../helpers');

// Handlers
const user = require('./user');
const token = require('./token');
const check = require('./check');

const acceptableMethods = ['post', 'get', 'put', 'delete'];


const handlers = {
	//API handlers
	user: (data, callback) => {
		const method = data.method.toLowerCase();
		if (!acceptableMethods.includes(method)) return callback(405);

		user[method](data, callback);
	},
	token: (data, callback) => {
		const method = data.method.toLowerCase();
		if (!acceptableMethods.includes(method)) return callback(405);

		token[method](data, callback);
	},
	check: (data, callback) => {
		const method = data.method.toLowerCase();
		if (!acceptableMethods.includes(method)) return callback(405);

		check[method](data, callback);
	},
	ping: (data, callback) => {
		callback(200);
	},
	hello: (data, callback) => {
		callback(200, { message: 'You are Welcome!' });
	},
	notFound: (data, callback) => {
		callback(404);
	}
};

// HTML handlers
handlers.index = (data, callback) => {
	const templateData = {
		'head.title': 'Main Page',
		'head.description': 'This is a study project',
		'body.title': 'This is a study project with Node',
		'body.class': 'main'
	};
	if (data.method === 'GET') {
		helpers.getTemplate('index', templateData, (err, template) => {
			if (err || !template) return callback(500, undefined, 'html');
			helpers.addUniversalTemplates(template, templateData, (err, resultTemplate) => {
				if (err) return callback(500, undefined, 'html');
				callback(200, resultTemplate, 'html');
			});
		});
	}

	else callback(405, undefined, 'html');
};

handlers.accountCreate =  (data, callback) => {
  const templateData = {
    'head.title': 'Create Account',
    'head.description': 'Create new account to continue',
    'body.title': 'Enter you requisites',
    'body.class': 'accountCreate'
  };
  if (data.method === 'GET') {
    helpers.getTemplate('accountCreate', templateData, (err, template) => {
      if (err || !template) return callback(500, undefined, 'html');
      helpers.addUniversalTemplates(template, templateData, (err, resultTemplate) => {
        if (err) return callback(500, undefined, 'html');
        callback(200, resultTemplate, 'html');
      });
    });
  }

  else callback(405, undefined, 'html');
};

handlers.sessionCreate =  (data, callback) => {
  const templateData = {
    'head.title': 'Login',
    'head.description': 'Login to continue',
    'body.title': 'Enter you requisites',
    'body.class': 'sessionCreate'
  };

  if (data.method === 'GET') {
    helpers.getTemplate('sessionCreate', templateData, (err, template) => {
      if (err || !template) return callback(500, undefined, 'html');
      helpers.addUniversalTemplates(template, templateData, (err, resultTemplate) => {
        if (err) return callback(500, undefined, 'html');
        callback(200, resultTemplate, 'html');
      });
    });
  }
  else callback(405, undefined, 'html');
};

handlers.sessionDeleted = (data, callback) => {
  const templateData = {
    'head.title': 'Logged Out',
    'head.description': 'You have been logged out from you account',
    'body.class': 'sessionDeleted'
  };

  if (data.method === 'GET') {
    helpers.getTemplate('sessionDeleted', templateData, (err, template) => {
      if (err || !template) return callback(500, undefined, 'html');
      helpers.addUniversalTemplates(template, templateData, (err, resultTemplate) => {
        if (err) return callback(500, undefined, 'html');
        callback(200, resultTemplate, 'html');
      });
    });
  }
  else callback(405, undefined, 'html');
};

handlers.accountEdit = (data, callback) => {
  const templateData = {
    'head.title': 'Account Edit Page',
    'body.class': 'accountEdit'
  };

  if (data.method === 'GET') {
    helpers.getTemplate('accountEdit', templateData, (err, template) => {
      if (err || !template) return callback(500, undefined, 'html');
      helpers.addUniversalTemplates(template, templateData, (err, resultTemplate) => {
        if (err) return callback(500, undefined, 'html');
        callback(200, resultTemplate, 'html');
      });
    });
  }
  else callback(405, undefined, 'html');
};

handlers.accountDeleted = (data, callback) => {
  const templateData = {
    'head.title': 'Account Deleted',
    'head.description': 'You have been delete out you account',
    'body.class': 'accountDeleted'
  };

  if (data.method === 'GET') {
    helpers.getTemplate('accountDeleted', templateData, (err, template) => {
      if (err || !template) return callback(500, undefined, 'html');
      helpers.addUniversalTemplates(template, templateData, (err, resultTemplate) => {
        if (err) return callback(500, undefined, 'html');
        callback(200, resultTemplate, 'html');
      });
    });
  }
  else callback(405, undefined, 'html');
};

handlers.checkCreate = (data, callback) => {
  const templateData = {
    'head.title': 'Create Check',
    'body.class': 'checkCreate'
  };

  if (data.method === 'GET') {
    helpers.getTemplate('checkCreate', templateData, (err, template) => {
      if (err || !template) return callback(500, undefined, 'html');
      helpers.addUniversalTemplates(template, templateData, (err, resultTemplate) => {
        if (err) return callback(500, undefined, 'html');
        callback(200, resultTemplate, 'html');
      });
    });
  }
  else callback(405, undefined, 'html');
};

handlers.checkList = (data, callback) => {
  const templateData = {
    'head.title': 'Dashboard',
    'body.class': 'checksList'
  };

  if (data.method === 'GET') {
    helpers.getTemplate('checksList', templateData, (err, template) => {
      if (err || !template) return callback(500, undefined, 'html');
      helpers.addUniversalTemplates(template, templateData, (err, resultTemplate) => {
        if (err) return callback(500, undefined, 'html');
        callback(200, resultTemplate, 'html');
      });
    });
  }
  else callback(405, undefined, 'html');
};

handlers.checkEdit = (data, callback) => {
  const templateData = {
    'head.title': 'Dashboard',
    'body.class': 'checksEdit'
  };

  if (data.method === 'GET') {
    helpers.getTemplate('checkEdit', templateData, (err, template) => {
      if (err || !template) return callback(500, undefined, 'html');
      helpers.addUniversalTemplates(template, templateData, (err, resultTemplate) => {
        if (err) return callback(500, undefined, 'html');
        callback(200, resultTemplate, 'html');
      });
    });
  }
  else callback(405, undefined, 'html');
};

handlers.favicon = (data, callback) => {
	if (data.method !== 'GET') return callback(405);

	helpers.getStaticAsset('favicon.ico', (err, data) => {
		if (err) return callback(500);

		callback(200, data, 'favicon');
	})
};

handlers.public = (data, callback) => {
	if (data.method !== 'GET') return callback(405);

	const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
	if (trimmedAssetName.length) {
		helpers.getStaticAsset(trimmedAssetName, (err, data) => {
			if (err) return callback(500);

			const contentType = trimmedAssetName.split('.')[1];
      console.log(contentType)
			callback(200, data, contentType)
		})
	}
};


module.exports = handlers;
