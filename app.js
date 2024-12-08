// ==UserScript==
// @name        FcBarca.com Twitter Fix
// @namespace   none
// @match       https://www.fcbarca.com/la-rambla*
// @grant       none
// @version     0.2.2
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

Date.prototype.monthNameList = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

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
    static TWITTER_REGEXP_EXACT = new RegExp(/^((https?:\/\/)?(x|twitter).com\/(.*?)\/status\/([0-9]+))[^\s]*$/i);
    static TWITTER_REGEXP_PARTIAL = new RegExp(/(x|twitter).com\/.*?\/status\/[0-9]+/i);

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
        const self = this;

        if (TwitterService.TWITTER_REGEXP_EXACT.test(text)) {
            var matchedGroup = text.match(TwitterService.TWITTER_REGEXP_EXACT);
            var matchedLink = matchedGroup[0];
            var matchedURL = matchedGroup[1].startsWith('http') ? matchedGroup[1] : 'https://' + matchedGroup[1];
            var matchedUsername = matchedGroup[4];
            var matchedTweetID = matchedGroup[5];

            LOG.info('Matched tweet from link: {' + matchedLink + '} with ID: {' + matchedTweetID + '} and URL: {' + matchedURL + '}.');
            $.ajax({
                url: 'https://publish.twitter.com/oembed?url=' + matchedURL,
                dataType: 'jsonp',
                success: function(data) {
                    LOG.debug('Succeeded at resolving tweet with ID: {' + matchedTweetID + '}.');
                    $node.replaceWith(data.html);
                },
                error: function($xhr, textStatus, errorThrown) {
                    LOG.debug('Failed at resolving tweet with ID: {' + matchedTweetID + '}. Using fallback instead.');
                    $node.replaceWith(self.#buildTweetFallback(matchedTweetID, matchedUsername));
                }
            });
        }
    }

    #reparseTweetsFallback(node) {
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
    observer.observe(document.getElementById('comments__list'), {childList: true, subtree: true});
});
