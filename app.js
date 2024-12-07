// ==UserScript==
// @name        FcBarca.com Twitter Fix
// @namespace   none
// @match       https://www.fcbarca.com/la-rambla*
// @grant       none
// @version     0.2.0
// @author      misterio
// @description Skrypt poprawiający osadzanie linków z X.com (Twitter)
// @license     MIT
// ==/UserScript==

/*jshint esversion: 11 */

//
// Extensions
//
Map.prototype.getOrDefault = function(key, defaultValue) {
    return this.has(key) ? this.get(key) : defaultValue;
}

RegExp.prototype.reset = function() {
    this.lastIndex = 0;
}

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
// Twitter Service
//
class TwitterService {
    static TWITTER_REGEXP = new RegExp(/^(https?:\/\/)?(x|twitter).com\/.*?\/status\/([0-9]+)[^\s]+$/i);
    static TWITTER_REGEXP_PARTIAL = new RegExp(/(x|twitter).com\/.*?\/status\/([0-9]+)/i);

    #nodeHandlerMap;

    constructor() {
        const self = this;

        self.#nodeHandlerMap = new Map([
            [Node.ELEMENT_NODE, node => self.#reparseTweetsInElementNode(node)],
            [Node.TEXT_NODE, node => self.#reparseTweetsInTextNode(node)],
        ]);
    }

    reparseTweetsInComments($commentList) {
        const self = this;

        $commentList.each(function() {
            var $comment = $(this);
            if ($comment.hasClass('rambla-item')) {
                self.reparseTweetsInComment($comment);
            }
        });
    }

    reparseTweetsInComment($comment) {
        const self = this;

        LOG.debug('Parsing comment with ID: {' + $comment.attr('data-comment-id') + '}.');

        // Phase 1: Try to fix message layout
        var $contentNodeList = $comment.find('.comment__content > p');
        $contentNodeList.each(function() {
            var $contentNode = $(this);

            $contentNode.contents().each(function() {
                self.#tryFixCommentLayout(this);
            });
        });

        // Phase 2: Embedding unloaded tweets
        var $contentNodeList = $comment.find('.comment__content > p');
        $contentNodeList.each(function() {
            var $contentNode = $(this);

            LOG.debug('Comment has {' + $contentNode.contents().length + '} node(s) to parse.');
            $contentNode.contents().each(function() {
                self.#nodeHandlerMap.getOrDefault(this.nodeType, node => self.#reparseTweetsFallback(node))(this);
            });
        });
    }

    #tryFixCommentLayout(node) {
        if (node.nodeType !== Node.TEXT_NODE) {
            return; // Only TEXT_NODE need this fix
        }

        var $node = $(node);
        var text = $node.text().trim();

        if (TwitterService.TWITTER_REGEXP.test(text)) {
            return; // Node is correct
        }

        if (!TwitterService.TWITTER_REGEXP_PARTIAL.test(text)) {
            return; // There is nothing to correct.
        }

        LOG.debug('Found node that requires correction.');
        var tokenList = text.split(/\s+/).map(function(token) {
            if (TwitterService.TWITTER_REGEXP.test(token)) {
                return '<br>' + token + '<br>';
            }

            return token;
        });

        $node.replaceWith(tokenList.join(' '));
    }

    #reparseTweetsInElementNode(node) {
        const self = this;

        var $node = $(node);
        if ($node.hasClass('external-link')) {
            self.#tryReparseTweetsInternal($node.attr('href'), $node);
        }
    }

    #reparseTweetsInTextNode(node) {
        const self = this;

        var $node = $(node);
        self.#tryReparseTweetsInternal($node.text().trim(), $node);
    }

    #tryReparseTweetsInternal(text, $node) {
        if (TwitterService.TWITTER_REGEXP.test(text)) {
            var matchedGroup = text.match(TwitterService.TWITTER_REGEXP);
            var matchedURL = matchedGroup[0].startsWith('http') ? matchedGroup[0] : 'https://' + matchedGroup[0];
            var matchedID = matchedGroup[3];

            LOG.info('Matched tweet with ID: {' + matchedID + '} and URL: {' + matchedURL + '}.');
            $.ajax({
                url: 'https://publish.twitter.com/oembed?url=' + matchedURL,
                dataType: 'jsonp',
                success: function(data) {
                    LOG.debug('Succeeded at resolving tweet with ID: {' + matchedID + '}.');
                    $node.replaceWith(data.html);
                }
            });
        }
    }

    #reparseTweetsFallback(node) {
        LOG.warn('Unhandled NodeType: {' + node.nodeType + '}.');
    }
}

//
// Main Script
//
$(function() {
    LOG.info('Fcbarca.com Twitter Fix Script initialized...');

    var twitterService = new TwitterService();

    // Parse comments that were loaded during sync-request
    var $commentList = $("#comments__list").find('.rambla-item');
    twitterService.reparseTweetsInComments($commentList);

    // Create observer to parse comments loaded on async-request
    var observer = new MutationObserver(function(mutationList) {
        mutationList.forEach(function(mutation) {
            var $commentList = $(mutation.addedNodes ?? []);
            twitterService.reparseTweetsInComments($commentList);
        });
    });

    // Pass in the target node, as well as the observer options
    observer.observe(document.getElementById('comments__list'), {childList: true});
});
