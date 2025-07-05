
// Role-based permission mapping
export const RoleNavigationPermissions = [
    {
        Role: "Account Manager",
        Permissions: [
            'Navigation.Admin.Dashboard',
            'Navigation.Users',
            'Navigation.Roles',
            'Navigation.Admin.Settings'
        ]
    },
    {
        Role: "Accountant",
        Permissions: [
            'Navigation.ProjectOwner.Dashboard',
            'Navigation.Projects',
            'Navigation.Customers',
            'Navigation.Procurement',
            'Navigation.Procurement.Overview',
            'Navigation.Procurement.Suppliers',
            'Navigation.Procurement.Purchase.Orders',
            'Navigation.Settings'
        ]
    }
];
