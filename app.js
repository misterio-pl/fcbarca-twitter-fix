// ==UserScript==
// @name        FcBarca.com Twitter Fix
// @namespace   none
// @match       https://www.fcbarca.com/la-rambla*
// @require     https://unpkg.com/tippy.js@2.6.0/dist/tippy.min.js
// @grant       none
// @version     0.3.1
// @author      misterio
// @description Skrypt poprawiający osadzanie linków z X.com (Twitter)
// @license     MIT
// ==/UserScript==

/*jshint esversion: 11 */

//
// STL Extensions
//
Map.prototype.getOrDefault = function(key, defaultValue) {
    return this.has(key) ? this.get(key) : defaultValue;
}

Date.prototype.monthNameList = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

Date.prototype.getMonthName = function() {
    return this.monthNameList[this.getMonth()];
};

Date.prototype.getDayOfMonth = function() {
    return this.getDate();
}

Date.prototype.toTwitterDate = function() {
    return `${this.getMonthName()} ${this.getDayOfMonth()}, ${this.getFullYear()}`;
}

//
// jQuery Extensions
//
$.fn.normalizedText = function() {
    return this.text().trim();
};

//
// Very simple logger to avoid unnecessary dependency for now...
//
class ConsoleLogger {
    constructor() {}

    debug(msg) {
        console.debug('DEBUG: ' + msg);
    }

    info(msg) {
        console.log('INFO: ' + msg);
    }

    warn(msg) {
        console.warn('WARN: ' + msg);
    }
}
const LOG = new ConsoleLogger();

//
// UI Service
//
class UIService {
    constructor() {
        document.head.removeChild(document.head.firstChild); // Remove <style> added by original tippy script
        document.head.insertAdjacentHTML('afterbegin', this.#createCss()); // Add custom <style>
    }

    registerComponents($commentList) {
        const self = this;

        $commentList.each(function() {
            var $commentNode = $(this);
            if ($commentNode.hasClass('comment') && $commentNode.hasClass('rambla-item')) {
                self.registerComponent($commentNode);
            }
        });

        tippy('div#comments__list li.dynamic__item > button[data-toggle="tooltip"]');
    }

    registerComponent($commentNode) {
        const self = this;
        $commentNode.children('div.comment__meta').find('ul.links').append(self.#createTwitterButton());
    }

    #createTwitterButton() {
        return `
            <li class="links__item dynamic__item">
                <button type="button" data-toggle="tooltip" class="button twitter-button" title="<div class='tooltip-comment'><p>Przełącz widok komentarza</p></div>">
                    <span class="icon icon-active svg-container" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
                            <path fill="#a21d3d" d="M302.973,57.388c-4.87,2.16-9.877,3.983-14.993,5.463c6.057-6.85,10.675-14.91,13.494-23.73
                            c0.632-1.977-0.023-4.141-1.648-5.434c-1.623-1.294-3.878-1.449-5.665-0.39c-10.865,6.444-22.587,11.075-34.878,13.783
                            c-12.381-12.098-29.197-18.983-46.581-18.983c-36.695,0-66.549,29.853-66.549,66.547c0,2.89,0.183,5.764,0.545,8.598
                            C101.163,99.244,58.83,76.863,29.76,41.204c-1.036-1.271-2.632-1.956-4.266-1.825c-1.635,0.128-3.104,1.05-3.93,2.467
                            c-5.896,10.117-9.013,21.688-9.013,33.461c0,16.035,5.725,31.249,15.838,43.137c-3.075-1.065-6.059-2.396-8.907-3.977
                            c-1.529-0.851-3.395-0.838-4.914,0.033c-1.52,0.871-2.473,2.473-2.513,4.224c-0.007,0.295-0.007,0.59-0.007,0.889
                            c0,23.935,12.882,45.484,32.577,57.229c-1.692-0.169-3.383-0.414-5.063-0.735c-1.732-0.331-3.513,0.276-4.681,1.597
                            c-1.17,1.32-1.557,3.16-1.018,4.84c7.29,22.76,26.059,39.501,48.749,44.605c-18.819,11.787-40.34,17.961-62.932,17.961
                            c-4.714,0-9.455-0.277-14.095-0.826c-2.305-0.274-4.509,1.087-5.294,3.279c-0.785,2.193,0.047,4.638,2.008,5.895
                            c29.023,18.609,62.582,28.445,97.047,28.445c67.754,0,110.139-31.95,133.764-58.753c29.46-33.421,46.356-77.658,46.356-121.367
                            c0-1.826-0.028-3.67-0.084-5.508c11.623-8.757,21.63-19.355,29.773-31.536c1.237-1.85,1.103-4.295-0.33-5.998
                            C307.394,57.037,305.009,56.486,302.973,57.388z"></path>
                        </svg>
                    </span>
                  <span class="visuallyhidden">Przełącz widok komentarza</span>
                </button>
            </li>
        `;
    }

    #createCss() {
        return `
            <style type="text/css">
                div#comments__list {
                    & div.comment > div.comment__meta li.dynamic__item {
                        display: none;

                        & .twitter-button {
                            padding: 0;
                            display: block;

                            & .icon {
                                top: -.2rem;
                                color: #8d8d8d;
                                width: 1.5rem;
                                height: 1.5rem;
                                display: block;
                                position: relative;
                            }

                            & .icon-active {
                                color: #a21d3d;
                            }
                        }
                    }

                    & div.comment__fixed > div.comment__meta li.dynamic__item {
                        display: inline-block;
                    }
                }

                @media (max-width: 575.98px) {
                    div#comments__list {
                        & div.comment > div.comment__meta li.dynamic__item .twitter-button .icon {
                            top:-.1rem;
                        }
                    }
                }
            </style>
        `;
    }
}

//
// Twitter Service
//
class TwitterService {
    static TWITTER_REGEXP_EXACT = new RegExp(/^((https?:\/\/)?(x|twitter).com\/(.*?)\/status\/([0-9]+))[^\s]*$/i);
    static TWITTER_REGEXP_PARTIAL = new RegExp(/(x|twitter).com\/.*?\/status\/[0-9]+/i);

    #nodeHandlerMap;
    #originalNodeMap;
    #modifiedNodeMap;

    constructor() {
        const self = this;

        self.#nodeHandlerMap = new Map([
            [Node.ELEMENT_NODE, (node, $commentNode) => self.#reparseTweetsInElementNode(node, $commentNode)],
            [Node.TEXT_NODE, (node, $commentNode) => self.#reparseTweetsInTextNode(node, $commentNode)],
        ]);
        
        self.#originalNodeMap = new Map();
        self.#modifiedNodeMap = new Map();
    }

    reparseTweetsInComments($commentList) {
        const self = this;

        $commentList.each(function() {
            var $commentNode = $(this);
            if ($commentNode.hasClass('comment') && $commentNode.hasClass('rambla-item')) {
                self.reparseTweetsInComment($commentNode);
            }
        });
    }

    reparseTweetsInComment($commentNode) {
        const self = this;
        
        var commentID = $commentNode.attr('data-comment-id');
        LOG.debug('Parsing comment with ID: {' + commentID + '}.');

        var $contentNode = $commentNode.children('.comment__content');
        if ($contentNode.length > 1) {
            throw new Error('Incorrect node size assumption. Expected is {1}, actual was {' + $contentNode.length + '}');
        }

        // Create deep copy of original node (before any modifications)
        self.#originalNodeMap.set(commentID, $contentNode.clone())

        // Phase 1: Try to fix message layout
        var $contentNodeList = $.merge($contentNode.children('p').contents(), $contentNode.contents().filter(':not(p)'));
        $contentNodeList.each(function() {
            self.#tryFixCommentLayout(this);
        });

        // Phase 2: Embedding unloaded tweets
        var $contentNodeList = $.merge($contentNode.children('p').contents(), $contentNode.contents().filter(':not(p)'));

        LOG.debug('Comment has {' + $contentNodeList.length + '} node(s) to parse.');
        $contentNodeList.each(function() {
            self.#nodeHandlerMap.getOrDefault(this.nodeType, (node, $commentNode) => self.#reparseTweetsFallback(node, $commentNode))(this, $commentNode);
        });

        // FIXME: This has to be planned some other way... Maybe Controller/ActionService/Presenter?
        if ($commentNode.hasClass('comment__fixed')) {
            $commentNode.children('div.comment__meta').find('li.dynamic__item > button').click(function() {
                var $iconNode = $(this).children('.icon');
                $iconNode.toggleClass('icon-active');

                if ($iconNode.hasClass('icon-active')) {
                    $commentNode.children('div.comment__content').replaceWith(self.#modifiedNodeMap.get(commentID));
                } else {
                    $commentNode.children('div.comment__content').replaceWith(self.#originalNodeMap.get(commentID));
                }
            })
        } else {
            LOG.debug('Remove unused node.');
            self.#originalNodeMap.delete(commentID);
        }
    }

    #tryFixCommentLayout(node) {
        if (node.nodeType !== Node.TEXT_NODE) {
            return; // Only TEXT_NODE need this fix
        }

        var $node = $(node);
        var text = $node.normalizedText();

        if (!TwitterService.TWITTER_REGEXP_PARTIAL.test(text)) {
            return; // There is nothing to correct
        }

        if (TwitterService.TWITTER_REGEXP_EXACT.test(text)) {
            return; // Node is correct
        }

        LOG.debug('Found node that requires correction.');
        var tokenList = text.split(/\s+/).map(function(token) {
            if (TwitterService.TWITTER_REGEXP_EXACT.test(token)) {
                return '<br>' + token + '<br>';
            }

            return token;
        });

        $node.replaceWith(tokenList.join(' '));
    }

    #reparseTweetsInElementNode(node, $commentNode) {
        const self = this;

        var $node = $(node);
        if ($node.hasClass('external-link')) {
            self.#tryReparseTweetsInternal($node.attr('href'), $node, $commentNode);
        }
    }

    #reparseTweetsInTextNode(node, $commentNode) {
        const self = this;

        var $node = $(node);
        self.#tryReparseTweetsInternal($node.normalizedText(), $node, $commentNode);
    }

    #tryReparseTweetsInternal(text, $node, $commentNode) {
        const self = this;

        if (TwitterService.TWITTER_REGEXP_EXACT.test(text)) {
            var matchedGroup = text.match(TwitterService.TWITTER_REGEXP_EXACT);
            var matchedLink = matchedGroup[0];
            var matchedURL = matchedGroup[1].startsWith('http') ? matchedGroup[1] : 'https://' + matchedGroup[1];
            var matchedUsername = matchedGroup[4];
            var matchedTweetID = matchedGroup[5];

            LOG.info('Matched tweet from link: {' + matchedLink + '} with ID: {' + matchedTweetID + '} and URL: {' + matchedURL + '}.');
            $commentNode.addClass('comment__fixed');

            $.ajax({
                url: 'https://publish.twitter.com/oembed?url=' + matchedURL,
                dataType: 'jsonp',
                success: function(data) {
                    LOG.debug('Succeeded at resolving tweet with ID: {' + matchedTweetID + '}.');
                    $node.replaceWith(data.html);
                },
                error: function($xhr, textStatus, errorThrown) {
                    LOG.debug('Failed with: {' + textStatus + '} at resolving tweet with ID: {' + matchedTweetID + '}. Using fallback instead.');
                    $node.replaceWith(self.#buildTweetFallback(matchedTweetID, matchedUsername));
                },
                complete: function($xhr) {
                    LOG.debug('Registering modified node.');
                    self.#modifiedNodeMap.set($commentNode.attr('data-comment-id'), $commentNode.children('.comment__content')); 
                }
            });
        }
    }

    #reparseTweetsFallback(node, $commentNode) {
        LOG.warn('Unhandled NodeType: {' + node.nodeType + '}.');
    }

    #buildTweetFallback(tweetID, username) {
        var currentDate = new Date().toTwitterDate();

        // FIXME: It would be useful to add readable username, but at the moment I have no idea how to do so...
        return `
            <blockquote class="twitter-tweet">
                <p lang="en" dir="ltr">Hmm...this page doesn’t exist. Try searching for something else.</p>
                &mdash; (@${username}) <a href="https://twitter.com/${username}/status/${tweetID}?ref_src=twsrc^tfw">${currentDate}</a>
            </blockquote>
        `;
    }
}

//
// Main Script
//
$(function() {
    LOG.info('Fcbarca.com Twitter Fix Script initialized...');

    var uiService = new UIService();
    var twitterService = new TwitterService();

    // Parse comments that were loaded during sync-request
    var $commentList = $('#comments__list').find('div.comment.rambla-item');
    uiService.registerComponents($commentList);
    twitterService.reparseTweetsInComments($commentList);

    // Create observer to parse comments loaded on async-request
    var observer = new MutationObserver(function(mutationList) {
        mutationList.forEach(function(mutation) {
            var $commentList = $(mutation.addedNodes ?? []);
            uiService.registerComponents($commentList);
            twitterService.reparseTweetsInComments($commentList);
        });
    });

    // Pass in the target node, as well as the observer options
    observer.observe(document.getElementById('comments__list'), {childList: true, subtree: true});
});
