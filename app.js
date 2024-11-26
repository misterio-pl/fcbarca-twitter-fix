// ==UserScript==
// @name        FcBarca.com Twitter Fix
// @namespace   none
// @match       https://www.fcbarca.com/la-rambla*
// @grant       none
// @version     0.1.1
// @author      misterio
// @description Skrypt poprawiający osadzanie linków z X.com (Twitter)
// @license     MIT
// ==/UserScript==

/*jshint esversion: 11 */

const TWITTER_REGEXP = new RegExp(/twitter.com\/.*\/status\/([0-9]+)/i);

$(function() {
    console.log('Script initialized...');

    var list = document.getElementById('comments__list');

    // Parse comments that were loaded during sync-request
    var $nodes = $(list).find('.rambla-item');
    $nodes.each(function() {
        console.log('Trying to reparse comment...');

        var $node = $(this);
        reparseTweetInComment($node);
    });

    // Create observer to parse comments loaded async-request
    var observer = new MutationObserver(function(mutationList) {
        mutationList.forEach(function(mutation) {
            var $nodes = $(mutation.addedNodes ?? []);

            $nodes.each(function() {
                var $node = $(this);
                if ($node.hasClass('rambla-item')) {
                    console.log('Trying to reparse comment...');

                    reparseTweetInComment($node);
                }
            });
        });
    });

    // Configuration of the observer
    var config = {
        attributes: true,
        childList: true,
        characterData: true,
    };

    // Pass in the target node, as well as the observer options
    observer.observe(list, config);
});

function reparseTweetInComment($comment) {
    var $contentNode = $comment.find('.comment__content > p');

    if (TWITTER_REGEXP.test($contentNode.text())) {
        var $textNodeList = $contentNode.contents().filter(function() {
            return this.nodeType === 3; //Node.TEXT_NODE
        });

        $textNodeList.each(function(index, element) {
            var text = $(element).text().trim();
            if (TWITTER_REGEXP.test(text)) {
                console.log('Matched Twitter ID...');

                var tweetId = text.match(TWITTER_REGEXP)[1];
                $(element).replaceWith(createTweet(tweetId));
            }
        });
    }
}

function createTweet(tweetId) {
    return `
    <blockquote class="twitter-tweet">
      <a href="https://twitter.com/username/status/${tweetId}"></a>
    </blockquote>
    `;
}
