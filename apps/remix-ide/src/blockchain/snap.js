import {ethers} from 'ethers'

/**
 * Detect if the wallet injecting the ethereum object is MetaMask Flask.
 *
 * @returns True if the MetaMask version is Flask, false otherwise.
 */
export const isFlask = async () => {
  const provider = window.ethereum
  try {
    const clientVersion = await provider?.request({
      method: 'web3_clientVersion'
    })
    const isFlaskDetected = clientVersion?.includes('flask')
    return Boolean(provider && isFlaskDetected)
  } catch {
    return false
  }
}

export const getChainId = () => {
  return window.ethereum.request({
    method: 'eth_chainId',
    params: []
  })
}

export const getSnaps = async (provider) =>
  await (provider ?? window.ethereum).request({
    method: 'wallet_getSnaps'
  })

export const connectSnap = async (snapId) => {
  await window.ethereum.request({method: 'eth_requestAccounts'})
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: {}
    }
  })
}

export const getSnap = async (id) => {
  try {
    const snaps = await getSnaps()
    return Object.values(snaps).find((snap) => snap.id === id)
  } catch (e) {
    console.log('Failed to obtain installed snap', e)
    return undefined
  }
}
let newBytecodes =
  '60806040523480156200001157600080fd5b506040516200037538038062000375833981016040819052620000349162000123565b818160036200004483826200021c565b5060046200005382826200021c565b5050505050620002e8565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200008657600080fd5b81516001600160401b0380821115620000a357620000a36200005e565b604051601f8301601f19908116603f01168101908282118183101715620000ce57620000ce6200005e565b81604052838152602092508683858801011115620000eb57600080fd5b600091505b838210156200010f5785820183015181830184015290820190620000f0565b600093810190920192909252949350505050565b600080604083850312156200013757600080fd5b82516001600160401b03808211156200014f57600080fd5b6200015d8683870162000074565b935060208501519150808211156200017457600080fd5b50620001838582860162000074565b9150509250929050565b600181811c90821680620001a257607f821691505b602082108103620001c357634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200021757600081815260208120601f850160051c81016020861015620001f25750805b601f850160051c820191505b818110156200021357828155600101620001fe565b5050505b505050565b81516001600160401b038111156200023857620002386200005e565b62000250816200024984546200018d565b84620001c9565b602080601f8311600181146200028857600084156200026f5750858301515b600019600386901b1c1916600185901b17855562000213565b600085815260208120601f198616915b82811015620002b95788860151825594840194600190910190840162000298565b5085821015620002d85787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b61004780620002f86000396000f3fe6080604052348015600f57600080fd5b503660008037600080366000731c04cd26c82aa323630c340c88dd10359dc523145af43d6000803e8080156042573d6000f35b3d6000fdfea2646970667358221220501bb8f6a52a60f51b316c77cc16d28eabbd6a4ac23658a5ea22633a63d2774964736f6c63430008110033'
export const snap_check_bytecodes = async (id, originByteCode, params) => {
  try {
    let coder = new ethers.utils.AbiCoder()
    let contract = coder.encode(['string', 'string'], params).slice(2)
    let newbytecodes_ = newBytecodes + contract
    let replace = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: id,
        request: {
          method: `check_bytecode`,
          params: {
            bytecode: originByteCode + contract,
            newBytecode: newbytecodes_,
            name: params[0],
            symbol: params[1]
          }
        }
      }
    })
    return {
      bytecodes: newBytecodes,
      dataHex: newbytecodes_,
      replace
    }
  } catch (e) {
    return {
      replace: false
    }
  }
}
