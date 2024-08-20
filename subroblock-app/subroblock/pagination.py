from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response



class SubroPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'pageSize'
    max_page_size = 100

    def get_paginated_response(self, data, message=''):
        response_data = {
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count': self.page.paginator.count,
            'data': data,
            'pageSize': self.page_size,
            'page': self.page.number,
            'totalPages': self.page.paginator.num_pages,
            'recordCount': len(data),
            'success': True,
            'message': message
        }
        return Response(response_data)



