export interface NavigationItem {
    id         : string;
    Name       : string;
    Sequence   : number;
    Permission : string;            // Permission required to access this item
    Label      : string;
    Icon       : string;
    Href       : string;
    ParentId   : string;            // ID of the parent item, if any
    Children  ?: NavigationItem[];  // Optional array of child items
}

// all icons are from iconify.design

export const AccountManagerNavigationItems: NavigationItem[] = [
    {
        id: 'Navigation-ProjectOwner-Dashboard',
        Name: 'NavigationProjectOwnerDashboard',
        Sequence: 1,
        Permission: 'Navigation.ProjectOwner.Dashboard',
        Label: 'Home',
        Icon: 'mdi:home-outline',
        Href: '/kleo/my-home',
        ParentId: null
    },
    {
        id: 'Navigation-Projects',
        Name: 'NavigationProjects',
        Sequence: 2,
        Permission: 'Navigation.Projects',
        Label: 'Projects',
        Icon: 'pepicons-pop:gear-circle',
        Href: '/kleo/projects',
        ParentId: null,
    },
    {
        id: 'Navigation-Customers',
        Name: 'NavigationCustomers',
        Sequence: 3,
        Permission: 'Navigation.Customers',
        Label: 'Customers',
        Icon: 'streamline-ultimate:customer-relationship-management-lead-management-1',
        Href: '/kleo/customers',
        ParentId: null
    },
    {
        id: 'Navigation-Procurement',
        Name: 'NavigationProcurement',
        Sequence: 4,
        Permission: 'Navigation.Procurement',
        Label: 'Procurement',
        Icon: 'mdi:truck-delivery-outline',
        Href: null,
        ParentId: null,
        Children: [
            {
                id: 'Navigation-Procurement-Overview',
                Name: 'NavigationProcurementOverview',
                Sequence: 1,
                Permission: 'Navigation.Procurement.Overview',
                Label: 'Overview',
                Icon: 'mdi:home-outline',
                Href: '/kleo/procurement/overview',
                ParentId: 'Navigation-Procurement'
            },
            {
                id: 'Navigation-Procurement-Suppliers',
                Name: 'NavigationProcurementSuppliers',
                Sequence: 2,
                Permission: 'Navigation.Procurement.Suppliers',
                Label: 'Suppliers',
                Icon: 'mdi:account-group',
                Href: '/kleo/procurement/suppliers',
                ParentId: 'Navigation-Procurement'
            },
            {
                id: 'Navigation-Procurement-Purchase-Orders',
                Name: 'NavigationProcurementPurchaseOrders',
                Sequence: 3,
                Permission: 'Navigation.Procurement.Purchase.Orders',
                Label: 'Purchase Orders',
                Icon: 'mdi:file-document-outline',
                Href: '/kleo/procurement/purchase-orders',
                ParentId: 'Navigation-Procurement'
            },
            {
                id: 'Navigation-Procurement-Inventory',
                Name: 'NavigationProcurementInventory',
                Sequence: 4,
                Permission: 'Navigation.Procurement.Inventory',
                Label: 'Inventory',
                Icon: 'ic:outline-inventory',
                Href: '/kleo/procurement/inventory-items',
                ParentId: 'Navigation-Procurement'
            }
        ]
    },
    {
        id: 'Navigation-Manufacturing',
        Name: 'NavigationManufacturing',
        Sequence: 5,
        Permission: 'Navigation.Manufacturing',
        Label: 'Manufacturing',
        Icon: 'streamline-ultimate:factory-industrial-robot-arm-1',
        Href: '/kleo/manufacturing',
        ParentId: null,
        Children: [
            {
                id: 'Navigation-Manufacturing-Overview',
                Name: 'NavigationManufacturingOverview',
                Sequence: 1,
                Permission: 'Navigation.Manufacturing.Overview',
                Label: 'Overview',
                Icon: 'mdi:home-outline',
                Href: '/kleo/manufacturing/overview',
                ParentId: 'Navigation-Manufacturing'
            },
            {
                id: 'Navigation-Manufacturing-Vendors',
                Name: 'NavigationManufacturingVendors',
                Sequence: 2,
                Permission: 'Navigation.Manufacturing.Vendors',
                Label: 'Vendors',
                Icon: 'octicon:people-16',
                Href: '/kleo/manufacturing/vendors',
                ParentId: 'Navigation-Manufacturing'
            },
            {
                id: 'Navigation-Manufacturing-Work-Orders',
                Name: 'NavigationManufacturingWorkOrders',
                Sequence: 3,
                Permission: 'Navigation.Manufacturing.Work.Orders',
                Label: 'Work Orders',
                Icon: 'material-symbols:order-play-outline',
                Href: '/kleo/manufacturing/work-orders',
                ParentId: 'Navigation-Manufacturing'
            },
            {
                id: 'Navigation-Manufacturing-Dispatch-Orders',
                Name: 'NavigationManufacturingDispatchOrders',
                Sequence: 4,
                Permission: 'Navigation.Manufacturing.Dispatch.Orders',
                Label: 'Dispatch Orders',
                Icon: 'famicons:documents-outline',
                Href: '/kleo/manufacturing/dispatch-orders',
                ParentId: 'Navigation-Manufacturing'
            }
        ]
    },
    {
        id: 'Navigation-Master-Data',
        Name: 'NavigationMasterData',
        Sequence: 6,
        Permission: 'Navigation.Master.Data',
        Label: 'Master Data',
        Icon: 'mdi:content-duplicate',
        Href: null,
        ParentId: null,
        Children: [
            {
                id: 'Navigation-Master-Data-Materials',
                Name: 'NavigationMasterDataMaterials',
                Sequence: 1,
                Permission: 'Navigation.Master.Data.Materials',
                Label: 'Materials',
                Icon: 'hugeicons:cylinder-02',
                Href: '/kleo/master-data/materials',
                ParentId: 'Navigation-Master-Data'
            },
            {
                id: 'Navigation-Master-Data-Manufacturing-Processes',
                Name: 'NavigationMasterDataManufacturingProcesses',
                Sequence: 2,
                Permission: 'Navigation.Master.Data.Manufacturing.Processes',
                Label: 'Manufacturing Processes',
                Icon: 'fluent-mdl2:processing-run',
                Href: '/kleo/master-data/manufacturing-processes',
                ParentId: 'Navigation-Master-Data'
            },
            {
                id: 'Navigation-Master-Data-Manufacturing-Steps',
                Name: 'NavigationMasterDataManufacturingSteps',
                Sequence: 3,
                Permission: 'Navigation.Master.Data.Manufacturing.Steps',
                Label: 'Manufacturing Steps',
                Icon: 'fluent-mdl2:step-insert',
                Href: '/kleo/master-data/manufacturing-steps',
                ParentId: 'Navigation-Master-Data'
            },
            {
                id: 'Navigation-Master-Data-Quality-Checks,',
                Name: 'NavigationMasterDataQualityChecks',
                Sequence: 4,
                Permission: 'Navigation.Master.Data.Quality.Checks',
                Label: 'Quality Checks',
                Icon: 'material-symbols:frame-inspect-rounded',
                Href: '/kleo/master-data/quality-checks',
                ParentId: 'Navigation-Master-Data'
            },
            {
                id: 'Navigation-Master-Data-Verticals,',
                Name: 'NavigationMasterDataVerticals',
                Sequence: 5,
                Permission: 'Navigation.Master.Data.Verticals',
                Label: 'Verticals',
                Icon: 'hugeicons:pathfinder-divide',
                Href: '/kleo/master-data/verticals',
                ParentId: 'Navigation-Master-Data'
            },
            {
                id: 'Navigation-Master-Data-Machines,',
                Name: 'NavigationMasterDataMachines',
                Sequence: 6,
                Permission: 'Navigation.Master.Data.Machines',
                Label: 'Machines',
                Icon: 'streamline-ultimate:coffee-espresso-machine',
                Href: '/kleo/master-data/machines',
                ParentId: 'Navigation-Master-Data'
            }
        ]
    },
    {
        id: 'Navigation-Settings',
        Name: 'NavigationSettings',
        Sequence: 7,
        Permission: 'Navigation.Settings',
        Label: 'Settings',
        Icon: 'mdi:settings-outline',
        Href: '/kleo/user-settings',
        ParentId: null
    }
];

export const AccountantNavigationItems: NavigationItem[] = [
    {
        id: 'Navigation-DesignManager-Dashboard',
        Name: 'NavigationDesignManagerDashboard',
        Sequence: 1,
        Permission: 'Navigation.DesignManager.Dashboard',
        Label: 'Home',
        Icon: 'mdi:home-outline',
        Href: '/design-manager/dashboard',
        ParentId: null
    },
    {
        id: 'Navigation-Projects',
        Name: 'NavigationProjects',
        Sequence: 2,
        Permission: 'Navigation.Projects',
        Label: 'Projects',
        Icon: 'pepicons-pop:gear-circle',
        Href: '/projects',
        ParentId: null,
    },
    {
        id: 'Navigation-Customers',
        Name: 'NavigationCustomers',
        Sequence: 3,
        Permission: 'Navigation.Customers',
        Label: 'Customers',
        Icon: 'streamline-ultimate:customer-relationship-management-lead-management-1',
        Href: '/customers',
        ParentId: null
    },
    {
        id: 'Navigation-Master-Data',
        Name: 'NavigationMasterData',
        Sequence: 6,
        Permission: 'Navigation.Master.Data',
        Label: 'Master Data',
        Icon: 'mdi:content-duplicate',
        Href: null,
        ParentId: null,
        Children: [
            {
                id: 'Navigation-Master-Data-Materials',
                Name: 'NavigationMasterDataMaterials',
                Sequence: 1,
                Permission: 'Navigation.Master.Data.Materials',
                Label: 'Materials',
                Icon: 'hugeicons:cylinder-02',
                Href: '/master-data/materials',
                ParentId: 'Navigation-Master-Data'
            },
            {
                id: 'Navigation-Master-Data-Manufacturing-Processes',
                Name: 'NavigationMasterDataManufacturingProcesses',
                Sequence: 2,
                Permission: 'Navigation.Master.Data.Manufacturing.Processes',
                Label: 'Manufacturing Processes',
                Icon: 'fluent-mdl2:processing-run',
                Href: '/master-data/manufacturing-processes',
                ParentId: 'Navigation-Master-Data'
            },
            {
                id: 'Navigation-Master-Data-Manufacturing-Steps',
                Name: 'NavigationMasterDataManufacturingSteps',
                Sequence: 3,
                Permission: 'Navigation.Master.Data.Manufacturing.Steps',
                Label: 'Manufacturing Steps',
                Icon: 'fluent-mdl2:step-insert',
                Href: '/master-data/manufacturing-steps',
                ParentId: 'Navigation-Master-Data'
            },
            {
                id: 'Navigation-Master-Data-Quality-Checks,',
                Name: 'NavigationMasterDataQualityChecks',
                Sequence: 4,
                Permission: 'Navigation.Master.Data.Quality.Checks',
                Label: 'Quality Checks',
                Icon: 'material-symbols:frame-inspect-rounded',
                Href: '/master-data/quality-checks',
                ParentId: 'Navigation-Master-Data'
            },
            {
                id: 'Navigation-Master-Data-Verticals,',
                Name: 'NavigationMasterDataVerticals',
                Sequence: 5,
                Permission: 'Navigation.Master.Data.Verticals',
                Label: 'Verticals',
                Icon: 'hugeicons:pathfinder-divide',
                Href: '/master-data/verticals',
                ParentId: 'Navigation-Master-Data'
            },
            {
                id: 'Navigation-Master-Data-Machines,',
                Name: 'NavigationMasterDataMachines',
                Sequence: 6,
                Permission: 'Navigation.Master.Data.Machines',
                Label: 'Machines',
                Icon: 'streamline-ultimate:coffee-espresso-machine',
                Href: '/master-data/machines',
                ParentId: 'Navigation-Master-Data'
            }
        ]
    },
    {
        id: 'Navigation-Settings',
        Name: 'NavigationSettings',
        Sequence: 7,
        Permission: 'Navigation.Settings',
        Label: 'Settings',
        Icon: 'mdi:settings-outline',
        Href: '/user-settings',
        ParentId: null
    }
];
