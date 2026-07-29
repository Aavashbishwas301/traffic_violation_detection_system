import React from "react";
import { 
  X, MapPin, Map, Database, Clock, 
  CreditCard, User, Car, Shield, Fingerprint, Calendar
} from "lucide-react";
import { Badge } from "./ui/Badge";

const DeepDiveModal = ({ isOpen, onClose, violation }) => {
  if (!isOpen || !violation) return null;

  const {
    locationPoint,
    statusHistory,
    vehicleId,
    ownerId, // Populated via vehicleId in backend
    fine,
    createdAt,
    location
  } = violation;

  const owner = ownerId || vehicleId?.ownerId || {};
  const vehicle = vehicleId || {};

  // Parse geospatial coordinates if available
  let coordinates = null;
  if (locationPoint && locationPoint.coordinates && locationPoint.coordinates.length === 2) {
    coordinates = {
      lng: locationPoint.coordinates[0],
      lat: locationPoint.coordinates[1]
    };
  }

  const mapLink = coordinates 
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-950 text-white rounded-xl shadow-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                DATABASE DEEP-DIVE
                <Badge variant="outline" className="text-[10px] tracking-widest text-primary-600 border-primary-200 bg-primary-50">NODE: {violation._id.slice(-6).toUpperCase()}</Badge>
              </h2>
              <p className="text-sm text-slate-500 font-medium">Complete relational & audit extraction</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Relational Entity Map */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Fingerprint className="w-4 h-4" /> Relational Entities
              </h3>
              <div className="space-y-3">
                {/* Vehicle Entity */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Car className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Entity: Vehicle</p>
                    <p className="font-black text-slate-900">{vehicle.licensePlate || "UNKNOWN"}</p>
                    <p className="text-xs text-slate-500 mt-1">ID: {vehicle._id || "N/A"}</p>
                  </div>
                </div>

                {/* Owner Entity */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Entity: Owner</p>
                    <p className="font-black text-slate-900">{owner.fullName || "UNREGISTERED"}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {owner.phoneNumber ? `TEL: ${owner.phoneNumber}` : "NO PHONE"} | ID: {owner._id || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Geospatial Data */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Geospatial Node
              </h3>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Raw Coordinate Plot</p>
                  <p className="font-mono text-sm font-bold text-slate-800 mt-1">
                    {coordinates ? `[ ${coordinates.lng}, ${coordinates.lat} ]` : "GEO_DATA_MISSING"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Resolved Location</p>
                  <p className="font-medium text-slate-700 mt-1">{location || "N/A"}</p>
                </div>
                {mapLink && (
                  <a 
                    href={mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-black px-4 py-2 rounded-full transition-colors"
                  >
                    <Map className="w-4 h-4" /> View on Map
                  </a>
                )}
              </div>
            </div>

            {/* Settlement Data */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Settlement Object
              </h3>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                {fine ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Gateway</p>
                        <p className="font-bold text-slate-900 mt-1">{fine.paymentMethod || "NONE"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Amount</p>
                        <p className="font-bold text-slate-900 mt-1">Rs. {fine.amountPaid || 0}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Transaction ID</p>
                      <p className="font-mono text-xs font-medium text-slate-600 mt-1 break-all">
                        {fine.transactionId || "NO_TRANSACTION_ID"}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm font-medium text-slate-500 italic">No settlement record attached.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Column (Audit Trail Timeline) */}
          <div className="space-y-4 lg:border-l lg:border-slate-100 lg:pl-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Immutable Audit Trail
            </h3>
            
            <div className="relative pt-2 pl-4">
              {/* Timeline Line */}
              <div className="absolute left-6 top-6 bottom-4 w-px bg-slate-200"></div>

              <div className="space-y-6">
                {/* Genesis Node */}
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-slate-400 shadow-sm z-10"></div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-slate-800 text-white">GENESIS</Badge>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700">Object Created</p>
                    <p className="text-xs text-slate-500 mt-1 italic">Initial entry into database.</p>
                  </div>
                </div>

                {/* History Nodes */}
                {statusHistory && statusHistory.map((hist, idx) => {
                  let colorClass = "bg-primary-500";
                  let badgeClass = "bg-primary-100 text-primary-700";
                  
                  if (hist.status === "Verified") {
                    colorClass = "bg-blue-500";
                    badgeClass = "bg-blue-100 text-blue-700 hover:bg-blue-200";
                  } else if (hist.status === "Paid") {
                    colorClass = "bg-green-500";
                    badgeClass = "bg-green-100 text-green-700 hover:bg-green-200";
                  } else if (hist.status === "Rejected") {
                    colorClass = "bg-red-500";
                    badgeClass = "bg-red-100 text-red-700 hover:bg-red-200";
                  }

                  return (
                    <div key={idx} className="relative pl-8">
                      <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white ${colorClass} shadow-sm z-10`}></div>
                      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={`${badgeClass} border-none shadow-none`}>STATE: {hist.status.toUpperCase()}</Badge>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {new Date(hist.changedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{hist.remarks || "No remarks provided."}</p>
                        <p className="text-[10px] text-slate-500 mt-2 font-mono flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Changed By: {hist.changedBy || "SYSTEM"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DeepDiveModal;
