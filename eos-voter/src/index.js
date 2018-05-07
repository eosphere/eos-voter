import m from "mithril";

var root = document.body

var Hello = {
    view: function() {
        return m("main", [
            m("h1", {class: "title"}, "Cast my vote"),
            m("button", "Do it"),
        ])
    }
}   
m.mount(root, Hello)

