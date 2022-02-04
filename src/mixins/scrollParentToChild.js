export const scrollMixin = {
    methods: {
        scrollParentToChild(parent, child) {
            // Where is the parent on page
            var parentRect = parent.getBoundingClientRect();
            // What can you see?
            var parentViewableArea = {
                height: parent.clientHeight,
                width: parent.clientWidth
            };

            // Where is the child
            var childRect = child.getBoundingClientRect();
            // Is the child viewable?
            var isViewable = (childRect.top >= parentRect.top) && (childRect.top <= parentRect.top + parentViewableArea.height);

            // if you can't see the child try to scroll parent
            if (!isViewable) {
                // scroll by offset relative to parent
                parent.scrollTop = (childRect.top + parent.scrollTop) - parentRect.top;
            }
       }
    }
}