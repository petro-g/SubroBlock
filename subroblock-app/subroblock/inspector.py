from drf_yasg.inspectors import PaginatorInspector
from drf_yasg import openapi

import logging

logger = logging.getLogger(__name__)


class SubroPaginatorInspector(PaginatorInspector):

    def fix_paginated_property(self, key: str, value: dict):
        logger.debug(f"Fixing paginated property: {key}")
        value.pop('example', None)
        if 'nullable' in value:
            value['x-nullable'] = value.pop('nullable')
        if key in {'next', 'previous'} and 'format' not in value:
            value['format'] = 'uri'
        return openapi.Schema(**value)

    def get_paginated_response(self, paginator, response_schema):
        logger.debug("Getting paginated response")
        if hasattr(paginator, 'get_paginated_response_schema'):
            paginator_schema = paginator.get_paginated_response_schema(response_schema)
            if paginator_schema['type'] == openapi.TYPE_OBJECT:
                properties = {
                    k: self.fix_paginated_property(k, v)
                    for k, v in paginator_schema.pop('properties').items()
                }
                properties['pageSize'] = openapi.Schema(type=openapi.TYPE_INTEGER)
                properties['page'] = openapi.Schema(type=openapi.TYPE_INTEGER)
                properties['totalPages'] = openapi.Schema(type=openapi.TYPE_INTEGER)
                properties['recordCount'] = openapi.Schema(type=openapi.TYPE_INTEGER)
                properties['success'] = openapi.Schema(type=openapi.TYPE_BOOLEAN)
                properties['message'] = openapi.Schema(type=openapi.TYPE_STRING)
                properties['data'] = properties.pop('results')  # Rename 'results' to 'data'

                if 'required' not in paginator_schema:
                    paginator_schema.setdefault('required', [])
                    for prop in ('count', 'data'):  # Update 'results' to 'data'
                        if prop in properties:
                            paginator_schema['required'].append(prop)
                return openapi.Schema(
                    **paginator_schema,
                    properties=properties
                )
            else:
                return openapi.Schema(**paginator_schema)

        return response_schema

    def get_paginator_parameters(self, paginator):
        logger.debug("Getting paginator parameters")
        return [
                openapi.Parameter(
                    name='page',
                    in_=openapi.IN_QUERY,
                    description='Page number',
                    type=openapi.TYPE_INTEGER
                ),
                openapi.Parameter(
                    name='pageSize',
                    in_=openapi.IN_QUERY,
                    description='Number of results per page',
                    type=openapi.TYPE_INTEGER
                )
            ]
