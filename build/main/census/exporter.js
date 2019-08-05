"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serviceManager_1 = require("../serviceManager");
const core_1 = require("@opencensus/core");
var CanonicalCodeString;
(function (CanonicalCodeString) {
    CanonicalCodeString["OK"] = "OK";
    CanonicalCodeString["CANCELLED"] = "CANCELLED";
    CanonicalCodeString["UNKNOWN"] = "UNKNOWN";
    CanonicalCodeString["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
    CanonicalCodeString["DEADLINE_EXCEEDED"] = "DEADLINE_EXCEEDED";
    CanonicalCodeString["NOT_FOUND"] = "NOT_FOUND";
    CanonicalCodeString["ALREADY_EXISTS"] = "ALREADY_EXISTS";
    CanonicalCodeString["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    CanonicalCodeString["RESOURCE_EXHAUSTED"] = "RESOURCE_EXHAUSTED";
    CanonicalCodeString["FAILED_PRECONDITION"] = "FAILED_PRECONDITION";
    CanonicalCodeString["ABORTED"] = "ABORTED";
    CanonicalCodeString["OUT_OF_RANGE"] = "OUT_OF_RANGE";
    CanonicalCodeString["UNIMPLEMENTED"] = "UNIMPLEMENTED";
    CanonicalCodeString["INTERNAL"] = "INTERNAL";
    CanonicalCodeString["UNAVAILABLE"] = "UNAVAILABLE";
    CanonicalCodeString["DATA_LOSS"] = "DATA_LOSS";
    CanonicalCodeString["UNAUTHENTICATED"] = "UNAUTHENTICATED";
})(CanonicalCodeString || (CanonicalCodeString = {}));
class CustomCensusExporter {
    constructor(config) {
        this.transport = serviceManager_1.ServiceManager.get('transport');
        this.config = config;
        this.buffer = new core_1.ExporterBuffer(this, {});
    }
    onEndSpan(root) {
        this.buffer.addToBuffer(root);
    }
    onStartSpan(root) { }
    sendTraces(zipkinTraces) {
        return new Promise((resolve, reject) => {
            zipkinTraces.forEach(span => {
                const isRootClient = span.kind === 'CLIENT' && !span.parentId;
                if (isRootClient && this.config.outbound === false)
                    return;
                this.transport.send('trace-span', span);
            });
            resolve();
        });
    }
    mountSpanList(rootSpans) {
        const spanList = [];
        for (const root of rootSpans) {
            spanList.push(this.translateSpan(root));
            for (const span of root.spans) {
                spanList.push(this.translateSpan(span));
            }
        }
        return spanList;
    }
    translateSpan(span) {
        const spanTranslated = {
            traceId: span.traceId,
            name: span.name,
            id: span.id,
            parentId: span.parentSpanId,
            kind: this.getSpanKind(span.kind),
            timestamp: span.startTime.getTime() * 1000,
            duration: Math.round(span.duration * 1000),
            debug: false,
            shared: false,
            localEndpoint: { serviceName: this.config.serviceName },
            tags: span.attributes
        };
        if (typeof spanTranslated.tags['result.code'] !== 'string') {
            spanTranslated.tags['result.code'] = CanonicalCodeString[span.status.code];
        }
        if (typeof span.status.message === 'string') {
            spanTranslated.tags['result.message'] = span.status.message;
        }
        return spanTranslated;
    }
    publish(rootSpans) {
        const spanList = this.mountSpanList(rootSpans);
        return this.sendTraces(spanList).catch((err) => {
            return err;
        });
    }
    getSpanKind(kind) {
        switch (kind) {
            case core_1.SpanKind.CLIENT: {
                return 'CLIENT';
            }
            case core_1.SpanKind.SERVER: {
                return 'SERVER';
            }
            default: {
                return 'UNKNOWN';
            }
        }
    }
}
exports.CustomCensusExporter = CustomCensusExporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2Vuc3VzL2V4cG9ydGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esc0RBQWtEO0FBRWxELDJDQUFnSTtBQU1oSSxJQUFLLG1CQWtCSjtBQWxCRCxXQUFLLG1CQUFtQjtJQUN0QixnQ0FBUyxDQUFBO0lBQ1QsOENBQXVCLENBQUE7SUFDdkIsMENBQW1CLENBQUE7SUFDbkIsNERBQXFDLENBQUE7SUFDckMsOERBQXVDLENBQUE7SUFDdkMsOENBQXVCLENBQUE7SUFDdkIsd0RBQWlDLENBQUE7SUFDakMsOERBQXVDLENBQUE7SUFDdkMsZ0VBQXlDLENBQUE7SUFDekMsa0VBQTJDLENBQUE7SUFDM0MsMENBQW1CLENBQUE7SUFDbkIsb0RBQTZCLENBQUE7SUFDN0Isc0RBQStCLENBQUE7SUFDL0IsNENBQXFCLENBQUE7SUFDckIsa0RBQTJCLENBQUE7SUFDM0IsOENBQXVCLENBQUE7SUFDdkIsMERBQW1DLENBQUE7QUFDckMsQ0FBQyxFQWxCSSxtQkFBbUIsS0FBbkIsbUJBQW1CLFFBa0J2QjtBQWlCRCxNQUFhLG9CQUFvQjtJQUsvQixZQUFhLE1BQXFCO1FBSDFCLGNBQVMsR0FBYywrQkFBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUk1RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUkscUJBQWMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQU1ELFNBQVMsQ0FBRSxJQUFjO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQy9CLENBQUM7SUFHRCxXQUFXLENBQUUsSUFBYyxJQUFHLENBQUM7SUFNdkIsVUFBVSxDQUFFLFlBQThCO1FBQ2hELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFP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