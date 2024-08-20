from django.core.paginator import Paginator
from django.db.models.expressions import Func


class ABS(Func):
    function = "ABS"


def page_results(results, request, per_page_default=20):
    per_page = int(request.GET.get("page_size", per_page_default))
    page_num = int(request.GET.get("page", 1))

    paginator = Paginator(results, per_page)

    if page_num > paginator.num_pages:
        raise Exception("Page count has been exceeded.")
    else:
        return paginator.page(page_num).object_list, paginator.num_pages, page_num, per_page


def parse_int(value, input_type="input"):
    try:
        return int(value)
    except:
        raise Exception(f"Invalid {input_type} value")
