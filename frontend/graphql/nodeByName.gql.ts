import { gql } from 'graphql-request';

export const nodeByName = gql`
query nodeByName($chainId: String!, $nodeName: String!) {
  nodeByName(chainId: $chainId, name: $nodeName) {
    NodeId
    NodeDetails {
      NodeName
      NodeImplementation
      NodeVersion
      Address
      NetworkId
      OperatingSystem
      CpuArchitecture {
        cpu
        memory
        core_count
        linux_kernel
        linux_distro
        is_virtual_machine
      }
      TargetEnv {
        cpu_hashrate_score
        memory_memcpy_score
        disk_sequential_write_score
        disk_random_write_score
      }
      NodeSysInfo
    }
  }
}
`
