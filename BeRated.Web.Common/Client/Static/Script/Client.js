﻿var BeRated;
(function (BeRated) {
    var CallMessage = (function () {
        function CallMessage(id, method, arguments) {
            this.id = id;
            this.method = method;
            this.arguments = arguments;
        }
        return CallMessage;
    })();
    BeRated.CallMessage = CallMessage;
})(BeRated || (BeRated = {}));
var BeRated;
(function (BeRated) {
    (function (Configuration) {
        Configuration.title = 'CS:GO Stats';
        Configuration.titlePrefix = Configuration.title + ' - ';
        Configuration.playerRoute = 'Player';
        Configuration.webSocketPort = 13337;

        Configuration.indexIcon = 'fa-gear';
        Configuration.playerIcon = 'fa-male';
        Configuration.errorIcon = 'fa-exclamation-circle';

        Configuration.sortIconAscending = 'fa-sort-asc';
        Configuration.sortIconDescending = 'fa-sort-desc';
    })(BeRated.Configuration || (BeRated.Configuration = {}));
    var Configuration = BeRated.Configuration;
})(BeRated || (BeRated = {}));
var BeRated;
(function (BeRated) {
    var Route = (function () {
        function Route(pattern, handler) {
            this.pattern = pattern;
            this.handler = handler;
        }
        Route.prototype.match = function (path) {
            var match = this.pattern.exec(path);
            if (match == null)
                return false;
            var captures = [];
            for (var i = 1; i < match.length; i++) {
                var capture = match[i];
                captures.push(capture);
            }
            this.handler.apply(null, captures);
            return true;
        };
        return Route;
    })();
    BeRated.Route = Route;
})(BeRated || (BeRated = {}));
var BeRated;
(function (BeRated) {
    var RpcClient = (function () {
        function RpcClient(url, onConnect, onDisconnect) {
            this.callbacks = {};
            this.id = 0;
            this.automaticReconnect = false;
            this.wasConnected = false;
            this.url = url;
            this.onConnect = onConnect;
            this.onDisconnect = onDisconnect;
            this.connect();
        }
        RpcClient.prototype.call = function (method, arguments, callback) {
            var id = this.id;
            this.id++;
            this.callbacks[id] = callback;
            var call = new BeRated.CallMessage(id, method, arguments);
            var message = JSON.stringify(call);
            this.webSocket.send(message);
        };

        RpcClient.prototype.isConnected = function () {
            var isConnected = this.webSocket.readyState == 1;
            return isConnected;
        };

        RpcClient.prototype.connect = function () {
            var socket = new WebSocket(this.url);
            this.webSocket = socket;
            socket.onopen = this.onOpen.bind(this);
            socket.onmessage = this.onMessage.bind(this);
            socket.onclose = this.onClose.bind(this);
            socket.onerror = this.onError.bind(this);
        };

        RpcClient.prototype.onOpen = function (event) {
            this.wasConnected = true;
            this.onConnect();
        };

        RpcClient.prototype.onMessage = function (event) {
            var message = JSON.parse(event.data);
            if (message.error != null) {
                console.error('RPC error: ' + message.error);
                return;
            }
            var id = message.id;
            if (typeof this.callbacks[id] === 'undefined') {
                console.error('Unexpected RPC result ID: ' + id);
                return;
            }
            var callback = this.callbacks[id];
            delete this.callbacks[id];
            callback(message.result);
        };

        RpcClient.prototype.onClose = function (event) {
            if (this.automaticReconnect) {
                console.error('Disconnected from server, attempting to reconnect');
                window.setTimeout(this.connect.bind(this), 5000);
            } else
                console.error('Disconnected from server');
            if (this.onDisconnect != null)
                this.onDisconnect(this.wasConnected);
        };

        RpcClient.prototype.onError = function (event) {
        };
        return RpcClient;
    })();
    BeRated.RpcClient = RpcClient;
})(BeRated || (BeRated = {}));
var BeRated;
(function (BeRated) {
    var DataTableColumn = (function () {
        function DataTableColumn(description, select, render, defaultSort, defaultSortMode) {
            if (typeof render === "undefined") { render = null; }
            this.render = null;
            this.defaultSort = false;
            this.defaultSortMode = null;
            this.header = null;
            this.description = description;
            this.select = select;
            if (render !== undefined)
                this.render = render;
            if (defaultSort !== undefined)
                this.defaultSort = defaultSort;
            if (defaultSortMode !== undefined)
                this.defaultSortMode = defaultSortMode;
        }
        return DataTableColumn;
    })();
    BeRated.DataTableColumn = DataTableColumn;
})(BeRated || (BeRated = {}));
var BeRated;
(function (BeRated) {
    var DataTableRow = (function () {
        function DataTableRow(record, row) {
            this.record = record;
            this.row = row;
        }
        return DataTableRow;
    })();
    BeRated.DataTableRow = DataTableRow;
})(BeRated || (BeRated = {}));
var BeRated;
(function (BeRated) {
    var Utility = (function () {
        function Utility() {
        }
        Utility.createIcon = function (className) {
            var icon = document.createElement('i');
            icon.classList.add('fa');
            icon.classList.add(className);
            return icon;
        };
        return Utility;
    })();
    BeRated.Utility = Utility;
})(BeRated || (BeRated = {}));
var BeRated;
(function (BeRated) {
    (function (SortMode) {
        SortMode[SortMode["Ascending"] = 0] = "Ascending";
        SortMode[SortMode["Descending"] = 1] = "Descending";
    })(BeRated.SortMode || (BeRated.SortMode = {}));
    var SortMode = BeRated.SortMode;

    var DataTable = (function () {
        function DataTable(data, columns) {
            this.rows = [];
            this.sortMode = null;
            this.sortColumn = null;
            this.table = null;
            this.headerRow = null;
            this.columns = columns;
            this.createTable(data);
        }
        DataTable.prototype.createTable = function (data) {
            var _this = this;
            var table = document.createElement('table');
            table.className = 'dataTable';
            this.table = table;
            this.headerRow = document.createElement('tr');
            this.columns.forEach((function (column) {
                if (column.defaultSort) {
                    if (_this.sortColumn != null)
                        throw new Error('There cannot be more than one default sort column');
                    _this.sortColumn = column;
                    _this.sortMode = SortMode.Ascending;
                    if (column.defaultSortMode != null)
                        _this.sortMode = column.defaultSortMode;
                }
                var header = document.createElement('th');
                header.onclick = function (event) {
                    return _this.onSortClick(column);
                };
                header.textContent = column.description;
                _this.headerRow.appendChild(header);
                column.header = header;
            }).bind(this));
            if (this.sortColumn == null) {
                throw new Error('No default sort column has been specified');
            }
            data.forEach((function (record) {
                var row = document.createElement('tr');
                _this.columns.forEach((function (column) {
                    var cell = document.createElement('td');
                    var render = column.render;
                    if (render == null) {
                        var value = column.select(record);
                        cell.textContent = value;
                    } else {
                        var value = column.select(record);
                        var node = render(value, record);
                        cell.appendChild(node);
                    }
                    row.appendChild(cell);
                }).bind(_this));
                _this.table.appendChild(row);
                var dataTableRow = new BeRated.DataTableRow(record, row);
                _this.rows.push(dataTableRow);
            }).bind(this));
            this.render();
        };

        DataTable.prototype.render = function () {
            var _this = this;
            this.sortRows();
            while (this.table.firstChild)
                this.table.removeChild(this.table.firstChild);
            this.table.appendChild(this.headerRow);
            var iconClass = this.sortMode === SortMode.Ascending ? BeRated.Configuration.sortIconAscending : BeRated.Configuration.sortIconDescending;
            var icon = BeRated.Utility.createIcon(iconClass);
            this.sortColumn.header.appendChild(icon);
            this.rows.forEach((function (row) {
                _this.table.appendChild(row.row);
            }).bind(this));
        };

        DataTable.prototype.sortRows = function () {
            var _this = this;
            this.rows.sort((function (row1, row2) {
                var select = _this.sortColumn.select;
                var property1 = select(row1.record);
                var property2 = select(row2.record);
                var output = 0;
                if (property1 < property2)
                    output = -1;
else if (property1 > property2)
                    output = 1;
                if (_this.sortMode == SortMode.Descending)
                    output = -output;
                return output;
            }).bind(this));
        };

        DataTable.prototype.onSortClick = function (column) {
            var container = this.sortColumn.header;
            var icons = container.getElementsByTagName('i');
            for (var i = 0; i < icons.length; i++) {
                var icon = icons[i];
                container.removeChild(icon);
            }
            if (this.sortColumn == column) {
                if (this.sortMode === SortMode.Ascending)
                    this.sortMode = SortMode.Descending;
else
                    this.sortMode = SortMode.Ascending;
            } else {
                this.sortColumn = column;
                if (column.defaultSortMode == null) {
                    this.sortMode = SortMode.Ascending;
                    if (this.rows.length > 0) {
                        var firstRecord = this.rows[0].record;
                        var firstValue = column.select(firstRecord);
                        if (typeof firstValue === 'number')
                            this.sortMode = SortMode.Descending;
                    }
                } else {
                    this.sortMode = column.defaultSortMode;
                }
            }
            this.render();
        };
        return DataTable;
    })();
    BeRated.DataTable = DataTable;
})(BeRated || (BeRated = {}));
var BeRated;
(function (BeRated) {
    var client = null;

    var Client = (function () {
        function Client() {
            this.windowHasBeenLoaded = false;
            this.loadingContent = true;
            if (client != null) {
                throw new Error('Client has already been instantiated');
            }
            client = this;
            this.initialiseRpcClient();
            this.setRoutes();
            window.onload = this.onLoad.bind(this);
            window.onhashchange = this.onHashChange.bind(this);
        }
        Client.prototype.setRoutes = function () {
            this.routes = [
                new BeRated.Route(/^#?$/, this.routeIndex.bind(this)),
                new BeRated.Route(new RegExp('^#?' + BeRated.Configuration.playerRoute + '\\/(\\d+)$'), this.routePlayer.bind(this))
            ];
        };

        Client.prototype.onLoad = function (event) {
            this.windowHasBeenLoaded = true;
            this.routeRequest();
        };

        Client.prototype.onConnect = function () {
            this.routeRequest();
        };

        Client.prototype.onDisconnect = function (wasConnected) {
            this.clearBody();
            var message;
            if (wasConnected)
                message = 'Disconnected from server';
else
                message = 'Unable to connect';
            var error = this.createHeader(BeRated.Configuration.errorIcon, message);
            error.classList.add('error');
            document.body.appendChild(error);
        };

        Client.prototype.initialiseRpcClient = function () {
            var pattern = /^\w+:\/\/([^\/:]+)/;
            var match = pattern.exec(window.location.href);
            if (match == null)
                throw new Error('Unable to find host in location');
            var host = match[1];
            var port = BeRated.Configuration.webSocketPort;
            var url = 'ws://' + host + ':' + port + '/';
            this.rpcClient = new BeRated.RpcClient(url, this.onConnect.bind(this), this.onDisconnect.bind(this));
        };

        Client.prototype.onHashChange = function (event) {
            if (!this.loadingContent)
                this.routeRequest();
        };

        Client.prototype.routeRequest = function () {
            if (!this.windowHasBeenLoaded || !this.rpcClient.isConnected())
                return;
            this.startLoadingContent();
            var pattern = /^#?(.*)/;
            var match = pattern.exec(window.location.hash);
            var path = match[1];
            for (var i = 0; i < this.routes.length; i++) {
                var route = this.routes[i];
                var requestHasBeenRouted = route.match(path);
                if (requestHasBeenRouted)
                    return;
            }
            throw new Error('Invalid path');
        };

        Client.prototype.setTitle = function (title) {
            document.title = BeRated.Configuration.titlePrefix + title;
        };

        Client.prototype.routeIndex = function () {
            this.setTitle('Index');
            this.rpcClient.call('getAllPlayerStats', [], this.onGetAllPlayerStats.bind(this));
        };

        Client.prototype.routePlayer = function (playerIdString) {
            var playerId = parseInt(playerIdString);
            this.rpcClient.call('getPlayerStats', [playerId], this.onGetPlayerStats.bind(this));
        };

        Client.prototype.onGetAllPlayerStats = function (allPlayerStats) {
            this.clearBody();
            this.addAllPlayerStatsTable(allPlayerStats);
            this.doneLoadingContent();
        };

        Client.prototype.addAllPlayerStatsTable = function (allPlayerStats) {
            var columns = [
                new BeRated.DataTableColumn('Name', function (record) {
                    return record.name;
                }, this.renderPlayerStatsName.bind(this), true),
                new BeRated.DataTableColumn('Kills', function (record) {
                    return record.kills;
                }),
                new BeRated.DataTableColumn('Deaths', function (record) {
                    return record.deaths;
                }),
                new BeRated.DataTableColumn('Kill/death ratio', function (record) {
                    return record.killDeathRatio;
                }),
                new BeRated.DataTableColumn('Team kills', function (record) {
                    return record.teamKills;
                }),
                new BeRated.DataTableColumn('Games', function (record) {
                    return record.gamesPlayed;
                }),
                new BeRated.DataTableColumn('Rounds', function (record) {
                    return record.roundsPlayed;
                }),
                new BeRated.DataTableColumn('Rounds (CT)', function (record) {
                    return record.roundsPlayedCounterTerrorist;
                }),
                new BeRated.DataTableColumn('Rounds (T)', function (record) {
                    return record.roundsPlayedTerrorist;
                }),
                new BeRated.DataTableColumn('Games won', function (record) {
                    return record.gameWinPercentage;
                }, this.renderPercentage.bind(this)),
                new BeRated.DataTableColumn('Rounds won', function (record) {
                    return record.winPercentage;
                }, this.renderPercentage.bind(this)),
                new BeRated.DataTableColumn('Rounds won (T)', function (record) {
                    return record.winPercentageTerrorist;
                }, this.renderPercentage.bind(this)),
                new BeRated.DataTableColumn('Rounds won (CT)', function (record) {
                    return record.winPercentageCounterTerrorist;
                }, this.renderPercentage.bind(this))
            ];
            var header = this.createHeader(BeRated.Configuration.indexIcon, BeRated.Configuration.title);
            var dataTable = new BeRated.DataTable(allPlayerStats, columns);
            dataTable.table.classList.add('indexTable');
            document.body.appendChild(header);
            document.body.appendChild(dataTable.table);
        };

        Client.prototype.onGetPlayerStats = function (playerStats) {
            this.clearBody();
            this.setTitle(playerStats.name);
            this.addHeader(playerStats);
            var leftContainer = document.createElement('div');
            leftContainer.className = 'leftSide';
            var rightContainer = document.createElement('div');
            rightContainer.className = 'rightSide';
            document.body.appendChild(leftContainer);
            document.body.appendChild(rightContainer);
            this.addWeaponTable(playerStats, leftContainer);
            this.addEncounterTable(playerStats, leftContainer);
            this.addPurchases(playerStats, leftContainer);
            this.addKillDeathRatioHistory(playerStats, leftContainer);
            this.addPlayerGames(playerStats, rightContainer);
            this.doneLoadingContent();
        };

        Client.prototype.addHeader = function (playerStats) {
            var header = this.createHeader(BeRated.Configuration.playerIcon, playerStats.name);
            header.classList.add('playerHeader');
            header.onclick = function () {
                return window.location.hash = '';
            };
            document.body.appendChild(header);
        };

        Client.prototype.addTable = function (data, columns, container) {
            if (typeof container === "undefined") { container = document.body; }
            var dataTable = new BeRated.DataTable(data, columns);
            var table = dataTable.table;
            table.classList.add('individualPlayerStatsTable');
            container.appendChild(table);
        };

        Client.prototype.addWeaponTable = function (playerStats, container) {
            var weaponColumns = [
                new BeRated.DataTableColumn('Weapon', function (record) {
                    return record.weapon;
                }),
                new BeRated.DataTableColumn('Kills', function (record) {
                    return record.kills;
                }, null, true, BeRated.SortMode.Descending),
                new BeRated.DataTableColumn('Headshot kills', function (record) {
                    return record.headshots;
                }),
                new BeRated.DataTableColumn('Headshot kill percentage', function (record) {
                    return record.headshotPercentage;
                }, this.renderPercentage.bind(this))
            ];
            this.addTable(playerStats.weapons, weaponColumns, container);
        };

        Client.prototype.addEncounterTable = function (playerStats, container) {
            var encounterColumns = [
                new BeRated.DataTableColumn('Opponent', function (record) {
                    return record.opponentName;
                }, this.renderEncounterStatsName.bind(this), true),
                new BeRated.DataTableColumn('Encounters', function (record) {
                    return record.encounters;
                }),
                new BeRated.DataTableColumn('Kills', function (record) {
                    return record.kills;
                }),
                new BeRated.DataTableColumn('Deaths', function (record) {
                    return record.deaths;
                }),
                new BeRated.DataTableColumn('Win percentage', function (record) {
                    return record.winPercentage;
                }, this.renderPercentage.bind(this))
            ];
            this.addTable(playerStats.encounters, encounterColumns, container);
        };

        Client.prototype.addPurchases = function (playerStats, container) {
            var purchasesColumns = [
                new BeRated.DataTableColumn('Item', function (record) {
                    return record.item;
                }),
                new BeRated.DataTableColumn('Purchases', function (record) {
                    return record.timesPurchased;
                }),
                new BeRated.DataTableColumn('Purchases/round', function (record) {
                    return record.purchasesPerRound;
                }, null, true, BeRated.SortMode.Descending),
                new BeRated.DataTableColumn('Kills/purchase', function (record) {
                    return record.killsPerPurchase;
                }, null, false, BeRated.SortMode.Descending)
            ];
            this.addTable(playerStats.purchases, purchasesColumns, container);
        };

        Client.prototype.addKillDeathRatioHistory = function (playerStats, container) {
            var _this = this;
            var header = document.createElement('h1');
            header.className = 'dataHeader';
            header.textContent = 'Kill/death ratio';
            var graphContainer = document.createElement('div');
            graphContainer.className = 'killDeathRatioGraph';
            container.appendChild(header);
            container.appendChild(graphContainer);
            var data = [];
            var lastDay = null;
            playerStats.killDeathRatioHistory.forEach(function (x) {
                var date = new Date(x.day);
                if (lastDay == null || !_this.datesAreEqual(date, lastDay)) {
                    var sample = [date, x.killDeathRatio];
                    data.push(sample);
                    lastDay = date;
                }
            });
            var options = {
                labels: [
                    'Date',
                    'KDR'
                ],
                colors: [
                    'black'
                ],
                includeZero: true,
                valueRange: [0, null],
                axes: {
                    x: {
                        axisLabelFormatter: function (date) {
                            return _this.getDateString(date);
                        },
                        valueFormatter: function (ms) {
                            var date = new Date(ms);
                            return _this.getDateString(date);
                        }
                    }
                },
                xAxisLabelWidth: 80
            };
            var graph = new Dygraph(graphContainer, data, options);
        };

        Client.prototype.addPlayerGames = function (playerStats, container) {
            var _this = this;
            var columns = [
                new BeRated.DataTableColumn('Time', function (record) {
                    return new Date(record.gameTime + 'Z');
                }, this.renderGameTime.bind(this), true, BeRated.SortMode.Descending),
                new BeRated.DataTableColumn('Outcome', function (record) {
                    return record.outcome;
                }, this.renderOutcome.bind(this)),
                new BeRated.DataTableColumn('Score', function (record) {
                    return record.playerScore * 100 + record.enemyScore;
                }, this.renderScore.bind(this)),
                new BeRated.DataTableColumn('Team', function (record) {
                    return _this.getTeamValue(record.playerTeam);
                }, function (value, record) {
                    return _this.renderTeam(record.playerTeam);
                }),
                new BeRated.DataTableColumn('Enemy team', function (record) {
                    return _this.getTeamValue(record.enemyTeam);
                }, function (value, record) {
                    return _this.renderTeam(record.enemyTeam);
                })
            ];
            var dataTable = new BeRated.DataTable(playerStats.games, columns);
            dataTable.table.classList.add('gamesTable');
            container.appendChild(dataTable.table);
        };

        Client.prototype.getTeamValue = function (players) {
            var output = '';
            players.forEach(function (player) {
                return output += player.name + ', ';
            });
            return output;
        };

        Client.prototype.getDateString = function (date) {
            var output = date.getUTCFullYear().toString();
            output += '-' + this.addZero(date.getUTCMonth() + 1);
            output += '-' + this.addZero(date.getUTCDate());
            return output;
        };

        Client.prototype.getTimeString = function (date) {
            var output = this.getDateString(date);
            output += ' ' + this.addZero(date.getUTCHours());
            output += ':' + this.addZero(date.getUTCMinutes());

            return output;
        };

        Client.prototype.addZero = function (input) {
            if (input < 10)
                return '0' + input;
else
                return '' + input;
        };

        Client.prototype.datesAreEqual = function (date1, date2) {
            return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
        };

        Client.prototype.renderPlayer = function (name, id) {
            var node = document.createElement('a');
            node.href = '#' + BeRated.Configuration.playerRoute + '/' + id;
            node.textContent = name;
            return node;
        };

        Client.prototype.renderPlayerStatsName = function (name, record) {
            var node = this.renderPlayer(record.name, record.id);
            return node;
        };

        Client.prototype.renderEncounterStatsName = function (name, record) {
            var node = this.renderPlayer(record.opponentName, record.opponentId);
            return node;
        };

        Client.prototype.renderPercentage = function (percentage) {
            var text = percentage + '%';
            var node = document.createTextNode(text);
            return node;
        };

        Client.prototype.renderGameTime = function (time, record) {
            var text = this.getTimeString(time);
            var node = document.createTextNode(text);
            return node;
        };

        Client.prototype.renderScore = function (value, record) {
            var text = record.playerScore + ' - ' + record.enemyScore;
            var node = document.createTextNode(text);
            return node;
        };

        Client.prototype.renderOutcome = function (outcome, record) {
            var node = document.createElement('span');
            switch (outcome) {
                case 'loss':
                    node.textContent = 'Loss';
                    node.className = 'outcomeLoss';
                    break;

                case 'win':
                    node.textContent = 'Win';
                    node.className = 'outcomeWin';
                    break;

                case 'draw':
                    node.textContent = 'Draw';
                    node.className = 'outcomeDraw';
                    break;
            }
            return node;
        };

        Client.prototype.renderTeam = function (players) {
            var _this = this;
            var container = document.createElement('div');
            var first = true;
            players.forEach(function (player) {
                if (first) {
                    first = false;
                } else {
                    var separator = document.createTextNode(', ');
                    container.appendChild(separator);
                }
                var node = _this.renderPlayer(player.name, player.id);
                container.appendChild(node);
            });
            return container;
        };

        Client.prototype.createHeader = function (iconClass, title) {
            var header = document.createElement('h1');
            header.className = 'header';
            var icon = BeRated.Utility.createIcon(iconClass);
            var titleNode = document.createTextNode(title);
            header.appendChild(icon);
            header.appendChild(titleNode);
            return header;
        };

        Client.prototype.clearBody = function () {
            while (document.body.firstChild)
                document.body.removeChild(document.body.firstChild);
        };

        Client.prototype.startLoadingContent = function () {
            this.loadingContent = true;
            document.onclick = this.blockClickEvent.bind(this);
        };

        Client.prototype.doneLoadingContent = function () {
            document.onclick = function () {
            };
            this.loadingContent = false;
        };

        Client.prototype.blockClickEvent = function (event) {
            event.stopPropagation();
            event.preventDefault();
            event.stopImmediatePropagation();
            return false;
        };
        return Client;
    })();
    BeRated.Client = Client;
})(BeRated || (BeRated = {}));
new BeRated.Client();
