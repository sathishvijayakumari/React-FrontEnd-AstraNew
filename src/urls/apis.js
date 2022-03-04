// URLs for login and logout of the application
exports.loginAPI = "/api/login";
exports.logoutAPI = "/api/logout";

// URLs for floor map uploading and getting
exports.floorMap = "/api/uploadmap";

// URLs for gateways
exports.masterGateway = "/api/gateway/master";
exports.slaveGateway = "/api/gateway/slave";

// URLs for sensors
exports.tempertureSensor = "/api/sensor/temperaturehumidity";
exports.dailySensorData = "/api/sensor/dailydata?macaddress=";
exports.weeklySensorData = "/api/sensor/weeklydata?macaddress=";
exports.monthlySensorData = "/api/sensor/monthlydata?macaddress=";

exports.irqSensor = "/api/sensor/iaq";
exports.dailyIAQData = "/api/sensor/dailyiaqdata";
exports.weeklyIAQData = "/api/sensor/weeklyiaqdata";
exports.monthlyIAQData = "/api/sensor/monthlyiaqdata";

exports.sensors_details_macIds = "/api/sensor/multi";
exports.sensors_details_macId_details = "/api/sensor/multidetails";

// URLs for signal repeator
exports.signalRepeator = "/api/signalrepeator";

// URLs for zone
exports.zoneConfiguration = "/api/zones";
exports.zoneTrakcing = "/api/zonetracking";
exports.zoneWeeklyTracking = "/api/weeklyzonetracking";
exports.zoneMontylyTracking = "/api/monthlyzonetracking";

// URLs for employee
exports.employeeTag = "/api/employee/tags";
exports.employeeRegistration = "/api/employee/registration";
exports.employeeTracking = "/api/employee/tracking";
exports.employeeDistance = "/api/employee/distance";

// URLs for alert data
exports.alertData = "/api/alerts";
