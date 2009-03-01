import org.hyperic.hq.hqu.rendit.HQUPlugin

import WallmountController

class Plugin extends HQUPlugin {
	Plugin() {
		addAdminView(true, '/wallmount/index.hqu', 'Wall Mount')
    }         
}

