class SidebarState {
    private is_open: boolean = $state(false);
    private active_item: string = $state('');
    private active_item_type: string = $state('');

    isOpen(){
        return this.is_open;
    }
    setOpen(open: boolean){
        this.is_open = open;
    }
    setActiveItem(item: string){
        this.active_item = item;
    }
    setActiveItemType(type: string){
        this.active_item_type = type;
    }
    getActiveItem(){
        return this.active_item;
    }
    getActiveItemType(){
        return this.active_item_type;
    }
}

export const sidebarState = new SidebarState();