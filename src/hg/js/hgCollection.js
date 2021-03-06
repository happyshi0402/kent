// hgCollection.js - Interactive features for GTEX Body Map version of GTEx Gene track UI page

// Copyright (C) 2017 The Regents of the University of California

var hgCollection = (function() {
    var names = []; // a list of names that have been used
    var selectedNode = "collectionList"; // keep track of id of selected row
    var selectedTree = "collectionList"; // keep track of id of selected row
    var $tracks;  // the #tracks object
    var trees = [];

    function currentCollectionItems(node) {
        // populate the menu for the currentCollection tree
        var items = {
            deleteItem: { // The "delete" menu item
                label: "Delete",
                action: function () {
                    $(selectedTree).jstree( "delete_node", selectedNode);
                }
            }
        };

        // can't delete root
        if ($(node).attr('parent') === '#')
            delete items.deleteItem;

        return items;
        }

    function selectElements (selectableContainer, elementsToSelect) {
        // add unselecting class to all elements in the styleboard canvas except the ones to select
        $(".ui-selected", selectableContainer).not(elementsToSelect).removeClass("ui-selected").addClass("ui-unselecting");

        // add ui-selecting class to the elements to select
        $(elementsToSelect).not(".ui-selected").addClass("ui-selecting");

        // trigger the mouse stop event (this will select all .ui-selecting elements, and deselect all .ui-unselecting elements)
        selectableContainer.data("ui-selectable").refresh();
        selectableContainer.data("ui-selectable")._mouseStop(null);
    }

    function hideAllAttributes() {
        // hide all the "set attribute" dialogs
        $("#viewOptions").hide();
        $("#CustomCompositeOptions").hide();
        $("#CustomTrackOptions").hide();
        $("#TrackDbOptions").hide();
    }

    function selectNode(tree, node) {
        // called when a node in the currentCollection tree is selected
        var color = node.li_attr.color;
        var name =  node.li_attr.shortlabel;
        var description = node.li_attr.longlabel;
        var visibility = node.li_attr.visibility;
        var type = node.li_attr.viewtype;
        selectedNode = node;
        selectedTree = tree;

        if (!type) {
                hideAllAttributes();
                $("#viewOptions").show();
                $("#viewName").val(name);
                $("#viewDescription").val(description);
                $("#viewVis").val(visibility);
                $("#viewColorInput").val(color);
                $("#viewColorPicker").spectrum("set", color);
        } else if (type == 'collection') {
                hideAllAttributes();
                $("#CustomCompositeOptions").show();
                $("#collectionName").val(name);
                $("#collectionDescription").val(description);
                $("#collectionVis").val(visibility);
        } else  if (type == 'track') {
            hideAllAttributes();
            $("#CustomTrackOptions").show();
            $("#customName").val(name);
            $("#customDescription").val(description);
            $("#customVis").val(visibility);
            $("#customColorInput").val(color);
            $("#customColorPicker").spectrum("set", color);
        } else {
            hideAllAttributes();
            $("#TrackDbOptions").show();
        }
   }

    function selectTreeNode(evt, data)             {
        selectNode(evt.target, data.node);
    }

    function checkCallback( operation, node, node_parent, node_position, more) {
        // called during a drag and drop action to see if the target is droppable
        if ((operation === "copy_node") ||  (operation === "move_node")) {
            if (node_parent.li_attr.class === "nodrop")
                return false;
            if ($(node_parent).attr('parent') !== '#')
                return false;
        }

        return true;
    }

    function newCollection() {
        // called when the "New Collection" button is pressed
        var ourCollectionName = getUniqueName("coll");
        var ourTreeName = getUniqueName("tree");
        var newName = "A New Collection";
        var newDescription = "Description of New Collection";
        var attributes = "shortLabel='" +  newName + "' ";
        attributes += "longLabel='" +  newDescription + "' ";
        attributes += "color='" + "#0" + "' ";
        attributes += "viewType='" + "track" + "' ";
        attributes += "visibility='" + "full" + "' ";
        attributes += "name='" +  ourCollectionName + "' ";

        $('#collectionList').append("<li " + attributes +  "id='"+ourCollectionName+"'>A New Collection</li>");
        $('#currentCollection').append("<div id='"+ourTreeName+"'><ul><li " + attributes+ ">A New Collection</li><ul></div>");
        var newTree = $('#currentCollection div:last');
        trees[ourCollectionName] = newTree;
        $(newTree).jstree({
               "core" : {
                     "check_callback" : checkCallback
                         },
               'plugins' : ['dnd', 'conditionalselect', 'contextmenu'],
               'check_callback' : checkCallback,
               'contextmenu': { "items" : currentCollectionItems},
               'dnd': {check_while_dragging: true}
        });
        $(newTree).on("select_node.jstree", selectTreeNode);
        var lastElement = $("#collectionList li").last();
        selectElements($("#collectionList"), lastElement) ;
        rebuildLabel();
    }

    function hideAllTrees() {
        // hide all the trees in the Collected Tracks window
        for(var key in trees)
            trees[key].hide();
    }

    function selectCollection(event, ui ) {
        // called with a collection is selected
        var id = ui.selected.id;
        $('#collectedTracksTitle').text(ui.selected.innerText);
        hideAllTrees();
        trees[id].show();
        var node = trees[id].find("li").first();
        trees[id].jstree('select_node', node);
        selectNode(trees[id], trees[id].jstree("get_node",node));

    }

    function addCollection(trees, list) {
        // called when outputting JSON of all the collectionList
        var collectTree = trees[list.id];
        var v = collectTree.jstree(true).get_json('#', {flat:true, no_data:true, no_state:true, no_a_attr:true});
        var mytext = JSON.stringify(v);
        return mytext;
    }

    function saveCollections(trees) {
       // called when the "Save" button is pressed
       var json = "[";
       $('#collectionList li').each(function() {
            json += addCollection(trees, this ) + ',';
        });
        json = json.slice(0, -1);
        json += ']';
        console.log(json);
        var requestData = 'jsonp=' + json;
        $.ajax({
            data:  requestData ,
            async: false,
            dataType: "JSON",
            type: "PUT",
            url: "hgCollection?cmd=saveCollection",
            trueSuccess: updatePage,
            success: catchErrorOrDispatch,
            error: errorHandler,
        });
    }

    function rebuildLabel() {
        var newText = selectedNode.li_attr.shortlabel + "   (" + selectedNode.li_attr.longlabel + ")";
        $(selectedTree).jstree('rename_node', selectedNode, newText);
    }

    function descriptionChange() {
        selectedNode.li_attr.longlabel = $("#customDescription").val();
        rebuildLabel();
    }

    function nameChange() {
        selectedNode.li_attr.shortlabel = $("#customName").val();
        rebuildLabel();
        if (selectedNode.parent === '#') {
            $("#collectionList .ui-selected").text($("#customName").val());
            $('#collectedTracksTitle').text($("#customName").val());
        }
    }

    function colorChange() {
        var color = $("#customColorPicker").spectrum("get"); $('#customColorInput').val(color);
        selectedNode.li_attr.color = $("#customColorInput").val();
    }

    function visChange() {
        selectedNode.li_attr.visibility = $("#customVis").val();
    }

    function isDraggable(nodes) {
        var ii;
        for (ii=0; ii < nodes.length; ii++)
            if (nodes[ii].children.length !== 0)
                return false;
        return true;
    }

    function collectionListRightClick (event) {
        $(".collectionList-menu").finish().toggle(100).css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        });
        return false;
    }

    function init() {
        // called at initialization time
        $("#customName").change(nameChange);
        $("#customDescription").change(descriptionChange);
        $("#customVis").change(visChange);
        //$("#customColorInput").change(colorChange);
        $("#saveCollections").click ( function() {saveCollections(trees);} );
        $("#discardChanges").click ( function () { window.location.reload(); });

        $("#newCollection").click ( newCollection );
        $('#collectionList').selectable({selected : selectCollection});
        
        $( "#collectionList" ).contextmenu(collectionListRightClick);

        $(document).bind("mousedown", function (e) {
                // If the clicked element is not the menu
                if ($(e.target).parents(".collectionList-menu").length === 0) {
                    // Hide it
                $(".collectionList-menu").hide(100);
                }
        });

        $(".collectionList-menu li").click(function(){

            // This is the triggered action name
            switch($(this).attr("data-action")) {
                // A case for each action. Your actions here
                case "delete": 
                    $("#collectionList .ui-selected").remove();
                    var firstElement = $("#collectionList li").first();
                    if (firstElement.length !== 0)
                        selectElements($("#collectionList"), firstElement) ;
                    else 
                        $(selectedTree).remove();

            }

            // Hide it AFTER the action was triggered
            $(".collectionList-menu").hide(100);
        });



        var trackOpt = {
            hideAfterPaletteSelect : true,
            color : $('#customColorInput').val(),
            showPalette: true,
            showInput: true,
            preferredFormat: "hex",
            change: colorChange,
//            change: function() { var color = $("#customColorPicker").spectrum("get"); $('#customColorInput').val(color); },
        };

        $("#customColorPicker").spectrum(trackOpt);
        //$.jstree.defaults.core.themes.icons = false;
        $.jstree.defaults.core.check_callback = checkCallback;
        $.jstree.defaults.core.themes.dots = true;
        $.jstree.defaults.contextmenu.show_at_node = false;
        $("#currentCollection div").each(function(index) {
            //$("#collection").append($(this).clone());
            var newTree = this;

            $(newTree).jstree({
               'plugins' : ['dnd', 'conditionalselect', 'contextmenu'],
               'contextmenu': { "items" : currentCollectionItems},
               'dnd': {
                "check_callback" : checkCallback,
                }
            });
            trees[this.id] = $(newTree);
           $(newTree).on("select_node.jstree", selectTreeNode);
        });
        $("#currentCollection  li").each(function() {
            names[this.getAttribute("name")] = 1;
        });
        treeDiv=$('#tracks');
        treeDiv.jstree({
               'plugins' : ['dnd', 'conditionalselect', 'contextmenu'],
               'dnd': {
                "check_callback" : checkCallback,
               'always_copy' : true,
                is_draggable: isDraggable,
               },
               'core' :  {
                "check_callback" : checkCallback
            }
        });


        var firstElement = $("#collectionList li").first();
        selectElements($("#collectionList"), firstElement) ;
    }

    function updatePage(responseJson) {
        // called after AJAX call
        if (!responseJson) {
            return;
        }
        var message = responseJson.serverSays;
        if (message) {
            alert(message);
        }
    }

    function getUniqueName(root) {
        // make sure name is unique in track hub
        if (!names[root]) {
            names[root] = true;
            return root;
        } else {
            var counter = 1;

            for(;;counter++) {
                var name  = root + counter;
                if (!names[name]) {
                    names[name] = true;
                    return name;
                }
            }
        }
    }

    return {
        init: init
    };
}());
