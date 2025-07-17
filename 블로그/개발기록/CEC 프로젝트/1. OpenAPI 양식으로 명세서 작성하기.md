# 1. 개요
## 1-1. 문제 상황
프론트가 화면을 API 와 연동하면서, **API 간의 일관성이 부족으로** 프론트가 수정 요청하는 상황이 있었다.
**관리자 웹** API는 어떻게든 수정해서 프론트와 연동을 완료했지만, **사용자 웹** API는 **관리자 웹**보다도 훨씬 더 일관성이 떨어졌다.

문제 사례는 다음과 같다.
1. 페이지네이션 공통 응답 DTO 를 사용해야 하는데, JPA Pageable 을 그대로 응답하는 경우가 있었다.
2. 모든 API 응답은, status, message, data 필드가 있어야 하는데, 그 규칙을 따르지 않은 경우가 있었다.
3. 필드명이 일관성 없는 경우는 너무나 많았다.
4. 필요한 API 가 없는 경우도 있었다. (게시글 좋아요 취소 / 조회)
  
> 당시 사용자 웹 API들을 보고싶으면,
> [Swagger Editor](https://editor.swagger.io/)에서 File > Import URL을 클릭 후 [이 주소](https://raw.githubusercontent.com/CEC-project/CEC-Back/refs/heads/main/docs/user-api-docs-before.yaml)를 붙여넣으면 된다.

이대로라면 프론트는 물론 백엔드도 수정을 반복하며 고통받을것이 분명했다.
기한을 절대 맞출 수 없을 것이라는 확신이 들었고, 문제를 파악하고 해결해야겠다고 결심했다.
## 1-2. 문제 분석
1. 팀원중 한명이 노션에 작성한 API 명세서가 유명무실한 것이 가장 큰 원인이다. 왜 그랬을까?
	- 기획이 변경될때, API 명세서가 최신화 되지 않았다.
	- 노션 무료 워크스페이스 용량이 초과되어 더이상 작성할 수 없었다.
	- 노션 명세서는 가독성이 떨어지는 문제가 있다.
	- 팀원이 AI를 이용해 작성한 API 명세서라서, 빠진 필드나 기획에 맞지 않는 부분도 있었다.
2. 명세서가 문제면 다시 쓰면 되는데, 작성하는데 **비용(=시간과 노력)** 이 부담스러웠다.
	- 문제를 해결하자고 결심한 떄를 기준으로, 13일후에 프로젝트를 마치자고 팀원들과 이야기가 되어있었다. 부족한점을 보완할 것까지 생각하면, 시간이 빠듯하다는 뜻이다.
	- API 엔드포인트 목록만 작성한다면 비용이 줄어 들겠지만, 심각한 문제들은 응답 필드들에서 발견되었으므로, API 응답에 대한 명세가 필요했다.
	- 전문 기획자들은 보통 엑셀로 작성하지만, 모든 API 응답이 status, message, data 필드를 공통으로 가지고, 특히 조회 응답시에 DTO가 공통으로 쓰이는 상황이다. 이때 API 별로 각각의 필드명과 그 타입을 일일이 엑셀로 쓰자니 비용이 너무 많이 들 것이었다.
## 1-3 문제 해결
아래 문단에서 설명할 **OpenAPI 명세서**를 도입해서 위 문제를 해결하였다.

# 2. OpenAPI 란?
![](OpenAPI.png)
OpenAPI 는 API 명세서 양식중 하나로, yaml 또는 json 형식으로 작성된다.
아래는 간단한 예시이며, [스웨거 에디터](https://editor.swagger.io/)에 붙여넣으면 보기 좋게 만들어준다.
```yaml
openapi: 3.0.3
info:
  title: Title
  version: 1.0.0
paths:
  /api/v1/posts/{id}:
    get:
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: 'OK'
          content:
            'application/json':
              schema:
                $ref: '#/components/schemas/PostResponse'
components:
  schemas:
    PostResponse:
      type: object
      properties:
        id:
          type: integer
        title:
          type: string
        content:
          type: string
```
명세서가 yaml 이나 json 파일같은 텍스트 파일이므로, 다음과 같은 장점이 있다.
## 2-1. 버전관리가 쉽다.
그냥 깃에 명세서 파일을 올리면, 누가 어떻게 수정했는지 관리할수 있다. [예시](https://github.com/CEC-project/CEC-Back/blob/main/docs/user-api-docs-after.yaml)
## 2-2. 명세서를 파싱해서 다루는 것이 쉽다.
1. 명세서를 파싱해서 보기 좋게 만들어 줄수있다. [Swagger UI](https://swagger.io/tools/swagger-ui/) [깃허브](https://github.com/swagger-api/swagger-ui).
2. 명세서를 파싱해서 온갖 언어로 백엔드/프론트 코드를 자동 생성할수도 있다. [openapi-generator](https://github.com/OpenAPITools/openapi-generator)
3. 본인이 담당하는 부분의 명세서만 볼수있게 분할시킬 수도 있다. [내가 짠 코드](https://github.com/qkr10/openapi-splitter). [결과 예시](https://github.com/CEC-project/CEC-Back/tree/main/docs/after)
## 2-3. 백엔드 코드로부터 역으로 명세서를 생성할수도 있다.
[springdoc-openapi](https://github.com/springdoc/springdoc-openapi) 라이브러리를 사용하면,
1. OpenAPI 양식의 명세서 자동 생성
2. Swagger UI 로 명세서를 보기좋게 만들어줌 [예시](https://dev.api.bmvcec.store/swagger-ui/index.html)
을 자동으로 해준다.

> 위의 `2-2-1`, `2-2-2`, `2-3` 기능은 Intellij에서도 [지원](https://www.jetbrains.com/help/idea/openapi.html)된다.

# 3. Swagger UI 란?
![](swagger_logo.svg)
Swagger UI 는 OpenAPI 양식의 명세서를 보기 좋게 시각화해주는 JavaScript 라이브러리이다.

다양한 옵션을 전달하여 사용자가 필요에 맞게 설정할 수도 있다. ([공식 문서](https://swagger.io/docs/open-source-tools/swagger-ui/usage/installation/))
- API를 **태그순 / 경로순 / 메서드순**으로 정렬하는 옵션
- 각 섹션을 **접기/펼치기** 설정하는 옵션 등

> 나는 위와같은 Swagger UI의 설정들을 사용자가 **GUI로 직접 선택**할 수 있도록 만들고,
> 해당 설정을 **쿠키에 저장하여 자동으로 불러오는 편의 기능**을 구현해 보았다.
> [직접 작성한 JS 코드](https://github.com/CEC-project/CEC-Back/tree/565808907505abe4fd0997315cdc05bcc9d1e422/src/main/resources/META-INF/resources/webjars/swagger-ui).
> [예시](https://dev.api.bmvcec.store/swagger-ui/index.html).

# 4. 결론
## 4-1. OpenAPI 명세서를 도입해 해결한 문제들
1. 노션 워크스페이스 용량 초과 문제
	- git과 github를 사용하여 OpenAPI 명세서를 저장하여 해결
2. 노션 명세서 가독성 문제
	- Swagger UI 나 인텔리제이 내장기능으로 보기좋게 만들어서 해결
3. API 일관성 부족 문제
	- 내가 명세서를 작성하고, 코드리뷰 시 명세서 기준으로 확인하여 해결
	  내가 작성한 명세서와 자동 생성된 명세서가 동일한 양식이므로, 검사하는 비용이 매우 줄어듬
4. 명세서를 다시 작성하는 비용 문제
	- 기존 백엔드 코드로 자동 생성된 명세서를, 필요한 부분만 수정하는 방식으로 해결
## 4-2. 아쉬웠던 점 & 한계
1. 팀원들이 코드리뷰를 거쳐야지만 내가 명세서에 적은대로 수정해 주었다.
	- yaml 명세서 간에 [diff를 보여줄 수 있는 사이트](https://wepplication.github.io/tools/compareDoc/)를 소개하고, [intellij로 편하게 볼 수 있다](https://www.jetbrains.com/help/idea/openapi.html)고 [전파](https://github.com/CEC-project/CEC-Back/blob/565808907505abe4fd0997315cdc05bcc9d1e422/docs/api-rule.md)했다. 하지만 springdoc-openapi 로 자동 생성된 yaml 명세서를 보는법은 충분히 설명하지 못했다.
	- 다시 그떄로 돌아간다면, 디스코드에서 직접 시연했을 것 같다. 사실 보기 좋게 띄우는 방법만 안다면, 작업한 내용이 명세서와 일치하는지 금방 확인할수 있다.
2. OpenAPI 명세서로 코드를 자동 생성할 수 있지만, 기존 아키텍처에 맞춰 적용하려면 노하우가 필요하다.
	- 코드를 자동 생성해주는 프로그램들은, 요청/응답 타입 코드와, API 테스트해주는 코드 수준에 그친다.
	- 결과물을 정규식을 사용해 변형하거나, 아니면 생성기 자체의 코드를 수정하거나.. 이런 비용이 추가적으로 들것 같다.
3. 노션/엑셀 기반 명세서에 비해, 명세서를 직접 작성하기 위한 [사전지식](https://swagger.io/specification/)이 너무 많다.
	- 물론 기존 명세서와 큰틀에서 같기 때문에, 조금만 알려주면 누구나 쓸수 있다고 생각한다.
4. 애초에 이런 일이 안생기는게 맞았다.
	- 팀이 만들어지고 나중에 합류하긴 했지만, 이렇게 심각한 문제가 될것을 내가 미리 알았더라면, 훨씬 적은 비용으로 해결할 수 있었을 것이다.