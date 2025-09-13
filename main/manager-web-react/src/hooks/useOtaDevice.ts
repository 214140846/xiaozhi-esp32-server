import { useMutation } from '@tanstack/react-query'
import otaDeviceApi from '@/api/otaDeviceApi'
import type { DeviceReportReqDTO, OtaHeaders } from '@/types/ota-device'

// Activate device (POST /ota/activate)
export const useActivateDevice = () => {
  return useMutation({
    mutationFn: (headers: OtaHeaders) => otaDeviceApi.activateDevice(headers),
  })
}

// Check OTA version (POST /ota/)
export const useCheckOTAVersion = () => {
  return useMutation({
    mutationFn: (variables: { headers: OtaHeaders; data: DeviceReportReqDTO }) =>
      otaDeviceApi.checkOTAVersion(variables.headers, variables.data),
  })
}

