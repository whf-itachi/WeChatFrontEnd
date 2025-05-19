import request from './request'

// 提交工单
export const submitTicket = (data) => {
  return request({
    url: '/tickets/submit',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取所有工单列表
export const getAllTicketList = () => {
  return request({
    url: '/tickets/list',
    method: 'get'
  })
}


// 获取包含指定字段的工单列表
export const getAllTicketsByarg = (query) => {
  return request({
    url: '/tickets/search',
    method: 'get',
    params: {
      query
    }
  })
}



// 根据用户id获取工单列表
export const getTicketList = () => {
  return request({
    url: '/tickets/my-tickets',
    method: 'get'
  })
}

// 获取工单详情
export const getTicketDetail = (id) => {
  return request({
    url: `/tickets/${id}`,
    method: 'get'
  })
}

// 更新工单
export const updateTicket = (data) => {
  const id = data.get('id')
  return request({
    url: `/tickets/${id}`,
    method: 'put',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除工单
export function deleteTicket(id) {
  return request({
    url: `/tickets/${id}`,
    method: 'delete'
  })
}

// 取消工单
export const cancelTicket = (id) => {
  return request({
    url: `/tickets/${id}/cancel`,
    method: 'post'
  })
}


// 获取所有机型
export const getAllTicketDeviceModels = () => {
  return request({
    url: '/tickets/device_models',
    method: 'get'
  })
}

// 获取所有客户
export const getAllTicketCustomers = () => {
  return request({
    url: '/tickets/customers',
    method: 'get'
  })
}