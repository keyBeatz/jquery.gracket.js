// jquery.gracket.js
// Erik M. Zettersten
// https://github.com/erik5388/jquery.gracket.js
// MIT
// Version 1.5.5


(function($) {
  $.fn.gracket = function(method) {

    // Defaults
    $.fn.gracket.defaults = {
      gracketClass : "g_gracket",
      gameClass : "g_game",
      gameDeClass : "g_game_de",
      roundClass : "g_round",
      roundDeClass : "g_round_de",
      roundLabelClass : "g_round_label",
      teamClass : "g_team",
      winnerClass : "g_winner",
      spacerClass : "g_spacer",
      currentClass : "g_current",
      seedClass : "g_seed",
      cornerRadius : 15,
      canvasId : "g_canvas",
      canvasClass : "g_canvas",
      canvasLineColor : "#eee",
      canvasLineCap : "round",
      canvasLineWidth : 2,
      canvasLineGap : 15,
      roundLabels : [],
      src : []
    };

    // global
    var
      container = this,
      inputData = (typeof container.data("gracket") === "undefined") ? [] :
                (typeof container.data("gracket") === "string") ? JSON.parse(container.data("gracket")) :
                    container.data("gracket"),
      team_count,
      round_count,
      game_count,
      max_round_width = []
    ;

    // Defaults => Settings
    $.fn.gracket.settings = {}

    // Public methods
    var methods = {
      init : function(options) {

        // merge options with settings
        this.gracket.settings = $.extend({}, this.gracket.defaults, options);

        if (this.gracket.settings.src.length)
          inputData = this.gracket.settings.src;

        // always prepend unique id to canvas id, as we dont want dupes
        this.gracket.settings.canvasId = this.gracket.settings.canvasId + "_" + ((new Date()).getTime());

        // build empty canvas
        var
          _canvas = document.createElement("canvas");
          _canvas.id = this.gracket.settings.canvasId;
          _canvas.className = this.gracket.settings.canvasClass;
          _canvas.style.position = "absolute";
          _canvas.style.left = 0;
          _canvas.style.top = 0;
          _canvas.style.right = "auto";

        // Append canvas & add class
        container
          .addClass(this.gracket.settings.gracketClass).prepend(_canvas);
          /*.append('<div class="g_top_branch"></div>');*/

        /*
        var topBranchContainer = container.find(".g_top_branch");
        topBranchContainer.prepend(_canvas);
        */

        // Detect system (single/double elimination & consolidation round) from input data
        var systemSetting = helpers.detectMatchSystem( inputData );
        this.gracket.settings.tournamentMode = systemSetting;
        var system = systemSetting.system;

        var data;
        console.log( system );
        if(system === "single_elimination") {
          data = inputData;
        }
        else if(system === "double_elimination") {
          data = inputData[0];
          console.log( "testing data", data );
        }

        //  create rounds
        round_count = data.length;
        for (var r=0; r < round_count; r++) {

          var round_html = helpers.build.round(this.gracket.settings, false, r, round_count);
            container.append(round_html);

          // create games in round
          game_count = data[r].length;
          for (var g=0; g < game_count; g++) {

            var
              game_html = helpers.build.game(this.gracket.settings),
              outer_height = container.find("." + this.gracket.settings.gameClass).outerHeight(true),
              spacer = helpers.build.spacer(this.gracket.settings, outer_height, r, (r !== 0 && g === 0) ? true : false)
            ;

            // append spacer
            if (g % 1 == 0 && r !== 0) round_html.append(spacer);

            // append game
            round_html.append(game_html);

            // create teams in game
            team_count = data[r][g].length;
            for (var t=0; t < team_count; t++) {

              var team_html = helpers.build.team(data[r][g][t], this.gracket.settings);
              game_html.append(team_html);

              var team_width = team_html.outerWidth(true);
              if (max_round_width[r] === undefined || max_round_width[r] < team_width)
                  max_round_width[r] = team_width;

              // adjust winner
              if (team_count === 1) {

                // remove spacer
                game_html.prev().remove()

                // align winner
                helpers.align.winner(game_html, this.gracket.settings, game_html.parent().prev().children().eq(0).height());

                // init the listeners after gracket is built
                helpers.listeners(this.gracket.settings, data, game_html.parent().prev().children().eq(1));

              }

            }

          }

        }

        if(system === "double_elimination") {

            var test = container.clone();
            container.append('<div class="g_divider"></div>');
            console.log( "cloning ", test );

            data = inputData[1];
            round_count = data.length;
            for (var r=0; r < round_count; r++) {

                var round_html = helpers.build.round(this.gracket.settings, true, r, round_count);
                container.append(round_html);

                // create games in round
                game_count = data[r].length;
                for (var g=0; g < game_count; g++) {

                    var
                        game_html = helpers.build.game(this.gracket.settings, true),
                        outer_height = container.find("." + this.gracket.settings.gameDeClass).outerHeight(true),
                        spacer = helpers.build.spacerDe(this.gracket.settings, outer_height, r, (r !== 0 && g === 0))
                    ;

                    // append spacer
                    if (g % 1 == 0 && r !== 0) round_html.append(spacer);

                    // append game
                    round_html.append(game_html);

                    // create teams in game
                    team_count = data[r][g].length;
                    for (var t=0; t < team_count; t++) {

                        var team_html = helpers.build.team(data[r][g][t], this.gracket.settings);
                        game_html.append(team_html);

                        var team_width = team_html.outerWidth(true);
                        if (max_round_width[r] === undefined || max_round_width[r] < team_width)
                            max_round_width[r] = team_width;

                        // adjust winner
                        if (team_count === 1) {

                            // remove spacer
                            game_html.prev().remove()

                            // align winner
                            helpers.align.winner(game_html, this.gracket.settings, game_html.parent().prev().children().eq(0).height());

                            // init the listeners after gracket is built
                            helpers.listeners(this.gracket.settings, data, game_html.parent().prev().children().eq(1));

                        }

                    }

                }

            }

            // append round indent before top branch
            var indentRounds = inputData[1].length - inputData[0].length;
            if( indentRounds ) {
                for( var i = 0; i < indentRounds; i++ )
                    container.find("canvas").after( helpers.build.roundIndent(this.gracket.settings).append( $("<div />", {
                        "class" : "g_indent"
                    }).css({
                        "width" : container.find("." + this.gracket.settings.gameDeClass).outerWidth(true) + 60
                    }) ) );

            }

            var deLastRound = $("<div />", {
                class: "g_de_last_round g_final"
            });
            var gracketSettings =  this.gracket.settings;
            var deLastRoundGame = helpers.build.game( gracketSettings );
            $.each( inputData[2][0], function(i, v) {
                console.log(v);
                deLastRoundGame.append( helpers.build.team( v, gracketSettings ) );
            });

            deLastRound.append( deLastRoundGame );
            container.append( deLastRound );

            console.log(deLastRound);

            function generateConnectors() {
                $(".g_round").each(function(i, v) {
                    var leftLine = $("<div />", {
                        "class" : "g_line"
                    }).css({
                        "width" : "30px"
                    });
                    $(this).after(leftLine);

                    var spacerTopHeight = $(this).find(".g_spacer:first").outerHeight(true) || 0;
                    var spacerHeight = $(this).find(".g_spacer:not(:first)").outerHeight(true) || 0;
                    $(this).find(".g_game").each(function(j,val) {
                        var matchHeight = $(this).outerHeight(true);
                        var teamHeight = $(this).find(".g_team").outerHeight(true);
                        if( j === 0 ) {
                            leftLine.append($("<div />", {
                                "class" : "g_line_spacer"
                            }).css({
                                height: teamHeight + spacerTopHeight
                            }));
                        }
                        else {
                            leftLine.append($("<div />", {
                                "class" : "g_line_spacer " + (j%2 !== 0 ? "g_line_draw" : "")
                            }).css({
                                height: matchHeight + spacerHeight
                            }));
                        }
                    });
                });

                $(".g_round:not(.g_round_de,.g_round_indent):first").addClass("g_round_first");
                $(".g_round_de:first").addClass("g_round_first");


            }
            generateConnectors();

            if( $(".g_gracket .g_semifinal").length > 1 ) {
                console.log("works");
                var teamHeight = 30;
                var matchBotMargin = 15;
                var firstEl = $(".g_gracket .g_round.g_semifinal:first .g_game");
                var secondEl = $(".g_gracket .g_round.g_semifinal:last .g_game");
                var heightBetween = secondEl.position().top - firstEl.position().top;

                console.log( "second top", secondEl.position().top, "first top", firstEl.position().top, "between", heightBetween  );

                $(".g_de_last_round").css({ top: heightBetween + teamHeight });

                console.log(firstEl.outerWidth(true));
                console.log(firstEl.position().left );
                console.log(firstEl.position().left + firstEl.outerWidth(true));

                container.append(
                    $("<div />", {
                        "class": "g_de_final_round_vertical_connector"
                    }).css({
                        top: firstEl.position().top + teamHeight,
                        height: heightBetween,
                        left: firstEl.position().left + firstEl.outerWidth(true)
                    })
                );
            }

        }
      }

    };

    // Private methods
    var helpers = {
      build : {
        team : function(data, node){
          var html = [
            '<h3'+ ((typeof data.score === "undefined") ? "" : " title=\"Score: " + data.score + "\"") +'>',
              '<span class="' + node.seedClass + '">',
                ((typeof data.displaySeed === "undefined") ? data.seed : data.displaySeed),
              '</span>',
              '&nbsp;' + data.name + '&nbsp;',
              '<small>',
                ((typeof data.score === "undefined") ? "" : data.score),
              '</small>',
            '</h3>'
          ].join("");
          return team = $("<div />", {
            "html" : html,
            "class" : node.teamClass + " " + (data.id || "id_null")
          });
        },
        game : function(node, bottomBranch){
          return game = $("<div />", {
            "class" :  node.gameClass + ( bottomBranch ? " " + node.gameDeClass : "" )
          });
        },
        round : function(node, bottomBranch, r, roundCount){
            var roundType = "";
            var num = node.tournamentMode.system === "double_elimination" ? 1 : 0;

            if( r + 1 === roundCount )
                roundType = node.tournamentMode.system === "double_elimination" ? "g_semifinal" : "g_final";
            else if( r === roundCount - 1 && node.tournamentMode.system !== "double_elimination" )
                roundType = "g_semifinal";
            else
                roundType = "g_round_num_" + r;

          return round = $("<div />", {
            "class" : node.roundClass + " " + roundType + " " + ( bottomBranch ? node.roundDeClass : "" )
          });
        },
        roundIndent : function(node){
          return round = $("<div />", {
            "class" : node.roundClass + " g_round_indent"
          });
        },
        spacer : function(node, yOffset, r, isFirst){
          return spacer = $("<div />", {
            "class" : node.spacerClass
          }).css({
            "height" : (isFirst) ?  (((Math.pow(2, r)) - 1) * (yOffset / 2)) : ((Math.pow(2, r) -1) * yOffset)
          });
        },
        spacerDe : function(node, yOffset, r, isFirst){
          var powBy = r > 1 ? r - (r - Math.floor(r/2)) : 0;
          return spacer = $("<div />", {
            "class" : node.spacerClass
          }).css({
            "height" : (isFirst) ?  (((Math.pow(2, powBy)) - 1) * (yOffset / 2)) : ((Math.pow(2, powBy) -1) * yOffset)
          });
        },
        labels : function(data, offset){

          var
            off = offset,
            i,
            len = data.length,
            left,
            widthPadding = 0
          ;

          for (i = 0; i < len; i++) {
            left = (i === 0 ? off.padding + widthPadding : off.padding + widthPadding + (off.right * i));
            $("<h5 />", {
              "html" : (off.labels.length ? off.labels[i] : "Round " + (i + 1)),
              "class" : off["class"]
            }).css({
              "position" : "absolute",
              "left" : left,
              "width" : offset.width
            }).prependTo(container);
            widthPadding += max_round_width[i]
          };

        },
        canvas : {
          resize : function(node){
            var canvas = document.getElementById(node.canvasId);
            canvas.height = container.innerHeight();
            canvas.width = container.innerWidth();
            $(canvas).css({
              height : container.innerHeight(),
              width : container.innerWidth(),
              zIndex : 1,
              pointerEvents : "none"
            });
          },
          draw : function(node, data, game_html){

            var canvas = document.getElementById(node.canvasId);

            // if we are using excanvas
            if (typeof G_vmlCanvasManager != "undefined") {
              G_vmlCanvasManager.initElement(canvas);
            };

            var ctx = canvas.getContext('2d');


            // set starting position -- will default to zero
            var
              _itemWidth = max_round_width[0],
              _itemHeight = game_html.outerHeight(true),
              _paddingLeft = (parseInt(container.css("paddingLeft")) || 0),
              _paddingTop = (parseInt(container.css("paddingTop")) || 0),
              _marginBottom = (parseInt(game_html.css("marginBottom")) || 0),
              _startingLeftPos = _itemWidth + _paddingLeft,
              _marginRight = (parseInt(container.find("> div").css("marginRight")) || 0),
              _cornerRadius = node.cornerRadius,
              _lineGap = node.canvasLineGap,
              _playerGap = (game_html.height() - 2 * game_html.find("> div").eq(1).height())
              _playerHt = game_html.find("> div").eq(1).height(),
              _totalItemWidth = 0
            ;

            if (typeof console !== "undefined")
              console.info("Padding Left: " + _paddingLeft + "px", "Player/Name Width: " + _itemWidth + "px", "Container padding left: " + _startingLeftPos + "px");

            //We must put a restriction on the corner radius and the line gap
            if (_cornerRadius > _itemHeight/3) _cornerRadius = _itemHeight/3;

            if (_cornerRadius > _marginRight/2) _cornerRadius = _marginRight/2 - 2;

            if (_cornerRadius <= 0) _cornerRadius = 1;

            if (_lineGap > _marginRight/3) _lineGap = _marginRight/3;

            // set styles
            ctx.strokeStyle = node.canvasLineColor;
            ctx.lineCap = node.canvasLineCap;
            ctx.lineWidth = node.canvasLineWidth;

            return;
            // only need to start path once
            ctx.beginPath();

            var
              p = Math.pow(2, data.length - 2),
              i = 0,
              j,
              r = 0.5,
              ifOneGame = ((i === 0 && p === 1) ? true : false)
            ;

            // if only one game, fix canvas pos x and pos y
            if (ifOneGame) {
                var _ref = $("." + node.gameClass);
                var _item = _ref.eq( _ref.length - 1 );
                _itemHeight = _item.outerHeight(true);
                _itemWidth = _item.outerWidth(true);
            };

            while (p >= 1) {

              for (j = 0; j < p; j++) {

                if (p == 1) r = 1;

                var
                  xInit = (ifOneGame) ? (_itemWidth + _paddingLeft) : (_startingLeftPos + _totalItemWidth + i *_marginRight),
                  xDisp = r * _marginRight,
                  yInit = ((Math.pow(2, i-1) - 0.5) * (i && 1) + j * Math.pow(2, i)) * _itemHeight + _paddingTop + ((ifOneGame) ? (_ref.find("> div").eq(1).height()) : (_playerHt)) + _playerGap/2
                ;

                if (p > 1) {
                  // top bracket horizontal line
                  ctx.moveTo(xInit + _lineGap, yInit);
                  ctx.lineTo(xInit + xDisp - _cornerRadius, yInit);
                } else {
                  // winner horizontal line
                  ctx.moveTo(xInit + _lineGap, yInit)
                  ctx.lineTo(xInit + (3*_lineGap), yInit);
                }

                //Connecting Lines
                if (p > 1 && j % 2 == 0) {
                  // vertical line
                  var yTop = yInit + _cornerRadius;
                  var yBottom = yInit + Math.pow(2, i)*_itemHeight - _cornerRadius;
                  ctx.moveTo(xInit + xDisp, yTop);
                  ctx.lineTo(xInit + xDisp, yBottom);

                  //Here comes the rounded corners
                  var
                    _cx = xInit + xDisp - _cornerRadius,
                    _cy = yInit + _cornerRadius
                  ;

                  ctx.moveTo(_cx, _cy - _cornerRadius);
                  ctx.arcTo(_cx + _cornerRadius, _cy - _cornerRadius, _cx + _cornerRadius, _cy, _cornerRadius);

                  _cy = yInit + Math.pow(2, i)*_itemHeight - _cornerRadius;
                  ctx.moveTo(_cx + _cornerRadius, _cy - _cornerRadius);
                  ctx.arcTo(_cx + _cornerRadius, _cy + _cornerRadius, _cx, _cy + _cornerRadius, _cornerRadius);

                  var yMiddle = (yTop + yBottom) / 2;
                  ctx.moveTo(xInit + xDisp, yMiddle);
                  ctx.lineTo(xInit + xDisp + _lineGap, yMiddle);
                }
              }
              i++;
              _itemWidth = max_round_width[i];
              _totalItemWidth += _itemWidth;
              p = p/2;
            }

            // only need to stoke the path once
            ctx.stroke();

            // draw labels
            helpers.build.labels(data, {
              "padding" : _paddingLeft,
              "left" : _startingLeftPos,
              "right" : _marginRight,
              "labels" : node.roundLabels,
              "class" : node.roundLabelClass
            });

          }
        }
      },
      align : {
        winner : function(game_html, node, yOffset){
          var ifOneGame = (game_html.parent().siblings().not("canvas").length === 1) ? true : false;
          var offset = ifOneGame ? yOffset - (game_html.height() + (game_html.height() / 2)) : yOffset + (game_html.height() / 2);
          return game_html.addClass(node.winnerClass).css({
            "margin-top" : offset
          });
        }
      },
      listeners : function(node, data, game_html){

        // 1. Hover Trail
        var _gameSelector = "." + node.teamClass + " > h3";
        $.each($(_gameSelector), function(e){
          var id = "." + $(this).parent().attr("class").split(" ")[1];
          if (id !== undefined) {
            $(id).hover(function(){
              $(id).addClass(node.currentClass);
            }, function(){
              $(id).removeClass(node.currentClass);
            });
          };
        });

        helpers.build.canvas.resize(node);
        helpers.build.canvas.draw(node, data, game_html);

      },
      detectMatchSystem: function(data) {
        if(!data)
          throw "Non existing input data";

        if(typeof data !== "object")
          throw "Input data must be typeof object. Type of " + typeof data + " provided instead";

        // output has following format, this is defaults
        var settingOutput = {
          system: "single_elimination",
          consolidationRound: false
        };

        // check if provided array is 4 dimensional, then it is double elimination
        if((data[0]) && (data[0][0]) && (data[0][0][0]) && (data[0][0][0][0])) {
            if( data.length < 2 )
                throw "You have not provided double elimination data bottom branch in input data. Please see example json on github.";
            if( data.length < 3 )
                throw "You have not provided third array member which is used as final round between top and bottom data branch in double elimination system. Please see example json on github.";

            settingOutput.system = "double_elimination";
        } else {

        }

        return settingOutput;
      }
    };

    // if a method as the given argument exists
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error( 'Method "' +  method + '" does not exist in gracket!');
    }

  }

})(jQuery);