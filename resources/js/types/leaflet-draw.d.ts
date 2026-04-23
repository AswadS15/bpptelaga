import 'leaflet'

declare module 'leaflet' {
  namespace Control {
    class Draw extends Control {
      constructor(options?: any)
    }
  }

  namespace Draw {
    namespace Event {
      const CREATED: string
      const EDITED: string
      const DELETED: string
    }
  }

  namespace GeometryUtil {
    function geodesicArea(latlngs: LatLng[]): number
  }
}
