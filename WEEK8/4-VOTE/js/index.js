let indexRender = (function ($) {
    let $userList = $('.userList'),
        $userContainer = $userList.find('ul'),
        $userTip = $userList.find('.tip'),
        $headerBox = $('.headerBox'),
        $input = $headerBox.find('input'),
        $searchBtn = $headerBox.find('.searchBtn');

    let $plan = $.Callbacks(),
        limit = 10,//=>每页展示的数量
        page = 1,//=>当前页码
        pageNum = 0,//=>总页数
        total = 0,//=>总数量
        isLoading = true;//=>用来记录当前是否正在加载最新的数据 TRUE:正在加载 FALSE:已经加载完成

    //=>记录一些后续可能会用到的数据
    $plan.add(result=> {
        pageNum = result.pageNum;
        total = result.total;

        result['code'] == 0 ? ($userContainer.css('display', 'block'), $userTip.css('display', 'none')) : ($userContainer.css('display', 'none'), $userTip.css('display', 'block'));
    });

    //=>数据绑定
    $plan.add(result=> {
        let {code, list}=result;
        if (code != 0) return;

        let str = ``;
        list.forEach((item, index)=> {
            let {id, name, picture, sex, matchId, slogan, voteNum, isVote}=item;
            str += `<li>
                <a href="detail.html?userId=${id}">
                    <img src="img/${sex == 0 ? 'man.png' : 'woman.png'}" alt="" class="picture">
                    <p class="title">
                        <span>${name}</span>
                        |
                        <span>编号 #${matchId}</span>
                    </p>
                    <p class="slogan">${slogan}</p>
                </a>
                <div class="vote">
                    <span class="voteNum">${voteNum}</span>
                    ${isVote == 1 ? `` : `<a href="javascript:;" class="voteBtn">投${sex == 0 ? `他` : `她`}一票</a>`}
                </div>
            </li>`;
        });
        $userContainer.append(str);

        isLoading = false;//=>数据绑定完成让其变为FALSE代表加载完成
    });

    //=>通过AJAX获取需要的数据
    let queryData = function () {
        $.ajax({
            url: '/getMatchList',
            type: 'GET',
            dataType: 'json',
            cache: false,
            data: {
                limit: limit,
                page: page,
                search: $input.val(),
                userId: 0
            },
            success: $plan.fire
        });
    };

    return {
        init: function () {
            queryData();

            //=>下拉刷新
            $(window).on('scroll', ()=> {
                if (isLoading) return;//=>数据正在加载中,滚动条滚动的时候不做任何的处理(避免数据重复加载)
                if (page >= pageNum) return;//=>当前页码已经超过总页数,也没有数据可以供加载了,此时我们也不再加载新的数据

                let {scrollTop:scrollT, clientHeight:winH, scrollHeight:scrollH}=document.documentElement;
                if (scrollT + winH + 100 >= scrollH) {
                    //->快到当前页面底边界了(距离还有100PX)
                    //->加载下一页的数据
                    isLoading = true;
                    page++;
                    queryData();
                }
            });
        }
    }
})(Zepto);
indexRender.init();