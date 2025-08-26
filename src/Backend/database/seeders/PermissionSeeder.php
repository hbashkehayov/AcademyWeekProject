<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\Permission\Models\Permission;
use App\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view tools',
            'create tools',
            'edit tools',
            'delete tools',
            'approve tools',
            'rate tools',
            'favorite tools',
            'view recommendations',
            'manage users',
            'manage roles',
            'manage organizations',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Sync Spatie roles with existing Role model records
        $roles = Role::all();
        
        foreach ($roles as $role) {
            $spatieRole = SpatieRole::firstOrCreate(['name' => $role->name]);
            
            // Assign permissions based on role
            switch ($role->name) {
                case 'owner':
                    $spatieRole->givePermissionTo(Permission::all());
                    break;
                    
                case 'product_manager':
                    $spatieRole->givePermissionTo([
                        'view tools',
                        'create tools',
                        'edit tools',
                        'approve tools',
                        'rate tools',
                        'favorite tools',
                        'view recommendations',
                        'manage users',
                    ]);
                    break;
                    
                case 'backend_developer':
                case 'frontend_developer':
                case 'designer':
                case 'qa_engineer':
                    $spatieRole->givePermissionTo([
                        'view tools',
                        'create tools',
                        'rate tools',
                        'favorite tools',
                        'view recommendations',
                    ]);
                    break;
            }
        }
    }
}