class TableauSubmenu {
    normalize = (workbooks) => {
        let submenu = [];
        workbooks.forEach(wk => {
            let aux = {
                string_name: wk.name.split('_')[1],
                toLink: 'tableau',
                param: {view: wk.viewUrl},
                visible: false,
            }
            submenu.push(aux);
        });

        return submenu;
    }
}

export default TableauSubmenu;